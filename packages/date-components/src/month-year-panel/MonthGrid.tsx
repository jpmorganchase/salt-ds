import {
  type ButtonProps,
  type DropdownProps,
  makePrefixer,
  useForkRef,
} from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type MutableRefObject,
  type Ref,
  type SyntheticEvent,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import calendarDayCss from "../calendar/internal/CalendarDay.css";
import { useLocalization } from "../localization-provider";
import { MonthGridHeader } from "./MonthGridHeader";
import { monthYearPanelMessages } from "./messages";
import { buildMonthsForYear, COLUMNS, MONTHS_PER_YEAR, ROWS } from "./utils";

const withBaseName = makePrefixer("saltMonthYearPanel");
const withDayBaseName = makePrefixer("saltCalendarDay");

/**
 * Per-month range-selection status flags. Semantics match CalendarDay's
 * day-range statuses so the existing `.saltCalendarMonth-range` CSS rules
 * apply verbatim.
 */
export interface MonthRangeStatus {
  /** Month is the start of the selected range. */
  selectedStart?: boolean;
  /** Month is the end of the selected range. */
  selectedEnd?: boolean;
  /** Month is strictly between the start and end of the range. */
  selectedSpan?: boolean;
  /** Range collapses onto a single month (start === end). */
  selectedSameDay?: boolean;
  /** Month is the tentative start while the user is hovering to preview a range. */
  hoveredStart?: boolean;
  /** Month is the tentative end while the user is hovering to preview a range. */
  hoveredEnd?: boolean;
  /** Month falls inside the hover-preview range. */
  hoveredSpan?: boolean;
}

/**
 * Imperative handle exposed via `apiRef`. Lets a parent (e.g. the range
 * panel) transfer keyboard focus to a specific month in this grid, which
 * is how cross-grid navigation between the start and end panels is wired.
 */
export interface MonthGridApi {
  /** Move DOM focus onto the month at the given 0-based index. */
  focusMonth(index: number): void;
}

export interface MonthGridProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Numeric year currently rendered by the grid. */
  year: number;
  /**
   * Fired when the user requests a different year via the header buttons,
   * PageUp/PageDown, or by navigating off the top/bottom of the grid.
   */
  onYearChange: (event: SyntheticEvent | null, year: number) => void;
  /** Roving-tabindex position, 0-11. */
  focusedIndex: number;
  onFocusedIndexChange: (index: number) => void;
  /**
   * @returns true when the month is the currently-selected value.
   */
  isMonthSelected: (date: DateFrameworkType) => boolean;
  /**
   * Optional range-selection status resolver. When provided, the grid switches
   * into range-selection styling (mirrors CalendarDay's `.saltCalendarMonth-range`
   * range rendering) and applies `selectedStart`/`selectedEnd`/`selectedSpan`/
   * `selectedSameDay` classes to draw a bridged pill across in-between months.
   */
  getMonthRangeStatus?: (date: DateFrameworkType) => MonthRangeStatus;
  /**
   * @returns a truthy reason string when the month should be non-interactive
   * (rendered disabled), otherwise falsy.
   */
  isMonthUnselectable?: (date: DateFrameworkType) => string | false | undefined;
  /** Fired when the user commits a month selection. */
  onMonthSelect: (event: SyntheticEvent, date: DateFrameworkType) => void;
  /**
   * Fired when the pointer enters/leaves a month. The panel can use this to
   * drive a hover-preview highlight for range selection.
   */
  onMonthHoverChange?: (date: DateFrameworkType | null) => void;
  /**
   * Ref forwarded to the currently focusable button. Used by
   * `FloatingFocusManager` to place the initial focus when the overlay opens.
   */
  focusedButtonRef?: Ref<HTMLElement>;
  /** Inclusive lower year bound (from min/max date, month-granular). */
  minYear?: number;
  /** Inclusive upper year bound. */
  maxYear?: number;
  /** Localised label for the overall grid (e.g. "Start month"). */
  ariaLabel?: string;
  /** Timezone forwarded from the DatePicker context. */
  timezone?: Timezone;
  /** Disables all interaction with the grid. */
  disabled?: boolean;
  /** Renders every month as read-only (buttons remain focusable). */
  readOnly?: boolean;
  /** Props forwarded to the previous-year button. */
  PreviousYearButtonProps?: Partial<ButtonProps>;
  /** Props forwarded to the next-year button. */
  NextYearButtonProps?: Partial<ButtonProps>;
  /** Props forwarded to the year dropdown. */
  YearDropdownProps?: Partial<DropdownProps<number>>;
  /**
   * Padding, in years, applied on either side of the visible year when
   * generating the dropdown option list and min/max are unspecified.
   * Defaults to 100.
   */
  yearDropdownRange?: number;
  /**
   * Imperative handle for cross-grid focus transfer. Receives an object
   * exposing `focusMonth(index)`. Populated once the grid has mounted.
   */
  apiRef?: Ref<MonthGridApi>;
  /**
   * Called when arrow-key navigation tries to leave the grid at its edge.
   * `direction` is `"forward"` (right/down past the last month) or
   * `"backward"` (left/up past the first month); `targetIndex` is the
   * grid index the arrow-move would land on, mapped into a would-be
   * adjacent grid (0–11).
   *
   * Return `true` to signal the parent handled the move (e.g. focus was
   * moved onto the sibling grid) and suppress this grid's own year
   * rollover. Return `false` (or omit the prop) to fall back to the
   * default behaviour of advancing this grid's visible year.
   */
  onNavigateOutOfRange?: (
    direction: "forward" | "backward",
    targetIndex: number,
  ) => boolean;
}

export const MonthGrid = forwardRef<HTMLDivElement, MonthGridProps>(
  function MonthGrid(props, ref) {
    const {
      year,
      onYearChange,
      focusedIndex,
      onFocusedIndexChange,
      isMonthSelected,
      getMonthRangeStatus,
      isMonthUnselectable,
      onMonthSelect,
      onMonthHoverChange,
      focusedButtonRef,
      minYear,
      maxYear,
      ariaLabel,
      timezone,
      disabled,
      readOnly,
      PreviousYearButtonProps,
      NextYearButtonProps,
      YearDropdownProps,
      yearDropdownRange = 100,
      apiRef,
      onNavigateOutOfRange,
      className,
      ...rest
    } = props;

    const { dateAdapter } = useLocalization();
    const targetWindow = useWindow();
    // Month buttons intentionally reuse the CalendarDay class contract so
    // they inherit the same visual treatment (background, hover, focus ring,
    // range endpoints). The testId must match the one used by CalendarDay
    // itself so the shared stylesheet is only injected once when both a
    // Calendar and a MonthYearPanel are present on the page.
    useComponentCssInjection({
      testId: "salt-calendar-day",
      css: calendarDayCss,
      window: targetWindow,
    });

    const months = useMemo(
      () => buildMonthsForYear(dateAdapter, year, timezone),
      [dateAdapter, timezone, year],
    );

    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const setContainerRef = useForkRef(ref, containerRef);

    useImperativeHandle(
      apiRef,
      () => ({
        focusMonth: (index: number) => {
          // The destination button's own `onFocus` handler will update
          // `focusedIndex` and the hover-preview state, so we don't need
          // to duplicate that bookkeeping here.
          buttonRefs.current[index]?.focus();
        },
      }),
      [],
    );
    /**
     * Set by handlers that need to move focus after the next render (roving
     * tabindex advance, year rollover). Consumed exactly once in the effect
     * below so we only imperatively focus buttons when the user asked us to –
     * never when the parent simply re-renders.
     */
    const pendingFocusIndex = useRef<number | null>(null);

    const canGoPrev = minYear === undefined || year - 1 >= minYear;
    const canGoNext = maxYear === undefined || year + 1 <= maxYear;

    useLayoutEffect(() => {
      if (pendingFocusIndex.current === null) return;
      const nextIndex = pendingFocusIndex.current;
      pendingFocusIndex.current = null;
      buttonRefs.current[nextIndex]?.focus();
    }, [focusedIndex, year]);

    const requestFocus = useCallback(
      (nextIndex: number) => {
        pendingFocusIndex.current = nextIndex;
        onFocusedIndexChange(nextIndex);
      },
      [onFocusedIndexChange],
    );

    const rolloverToYear = useCallback(
      (event: SyntheticEvent | null, nextYear: number, nextIndex: number) => {
        pendingFocusIndex.current = nextIndex;
        onFocusedIndexChange(nextIndex);
        onYearChange(event, nextYear);
      },
      [onFocusedIndexChange, onYearChange],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        if (disabled) return;
        let handled = true;
        switch (event.key) {
          case "ArrowRight": {
            if (index === MONTHS_PER_YEAR - 1) {
              if (onNavigateOutOfRange?.("forward", 0)) break;
              if (canGoNext) rolloverToYear(event, year + 1, 0);
            } else {
              requestFocus(index + 1);
            }
            break;
          }
          case "ArrowLeft": {
            if (index === 0) {
              if (
                onNavigateOutOfRange?.("backward", MONTHS_PER_YEAR - 1)
              )
                break;
              if (canGoPrev)
                rolloverToYear(event, year - 1, MONTHS_PER_YEAR - 1);
            } else {
              requestFocus(index - 1);
            }
            break;
          }
          case "ArrowDown": {
            const next = index + COLUMNS;
            if (next < MONTHS_PER_YEAR) {
              requestFocus(next);
            } else {
              const targetIndex = next - MONTHS_PER_YEAR;
              if (onNavigateOutOfRange?.("forward", targetIndex)) break;
              if (canGoNext) rolloverToYear(event, year + 1, targetIndex);
            }
            break;
          }
          case "ArrowUp": {
            const next = index - COLUMNS;
            if (next >= 0) {
              requestFocus(next);
            } else {
              const targetIndex = next + MONTHS_PER_YEAR;
              if (onNavigateOutOfRange?.("backward", targetIndex)) break;
              if (canGoPrev) rolloverToYear(event, year - 1, targetIndex);
            }
            break;
          }
          case "Home":
            requestFocus(0);
            break;
          case "End":
            requestFocus(MONTHS_PER_YEAR - 1);
            break;
          case "PageUp": {
            if (!canGoPrev) break;
            const delta = event.shiftKey ? 10 : 1;
            const nextYear = Math.max(
              minYear ?? Number.NEGATIVE_INFINITY,
              year - delta,
            );
            if (nextYear !== year) {
              pendingFocusIndex.current = index;
              onYearChange(event, nextYear);
            }
            break;
          }
          case "PageDown": {
            if (!canGoNext) break;
            const delta = event.shiftKey ? 10 : 1;
            const nextYear = Math.min(
              maxYear ?? Number.POSITIVE_INFINITY,
              year + delta,
            );
            if (nextYear !== year) {
              pendingFocusIndex.current = index;
              onYearChange(event, nextYear);
            }
            break;
          }
          default:
            handled = false;
        }
        if (handled) event.preventDefault();
      },
      [
        canGoNext,
        canGoPrev,
        disabled,
        maxYear,
        minYear,
        onNavigateOutOfRange,
        onYearChange,
        requestFocus,
        rolloverToYear,
        year,
      ],
    );

    const assignFocusedButtonRef = useCallback(
      (node: HTMLButtonElement | null) => {
        if (!focusedButtonRef) return;
        if (typeof focusedButtonRef === "function") {
          focusedButtonRef(node);
        } else {
          (focusedButtonRef as MutableRefObject<HTMLElement | null>).current =
            node;
        }
      },
      [focusedButtonRef],
    );

    return (
      <div
        {...rest}
        ref={setContainerRef}
        className={clsx(withBaseName(), className)}
      >
        <MonthGridHeader
          year={year}
          onYearChange={onYearChange}
          minYear={minYear}
          maxYear={maxYear}
          disabled={disabled}
          readOnly={readOnly}
          yearDropdownRange={yearDropdownRange}
          PreviousYearButtonProps={PreviousYearButtonProps}
          NextYearButtonProps={NextYearButtonProps}
          YearDropdownProps={YearDropdownProps}
        />
        <div
          role="grid"
          aria-label={ariaLabel ?? monthYearPanelMessages.singleGridLabel(year)}
          aria-rowcount={ROWS}
          aria-colcount={COLUMNS}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          onMouseLeave={
            onMonthHoverChange
              ? () => onMonthHoverChange(null)
              : undefined
          }
          onBlur={
            onMonthHoverChange
              ? (event) => {
                  // Clear the range-preview when keyboard focus leaves the
                  // grid entirely (e.g. Tab to the year dropdown, Escape,
                  // click outside). Focus moves between month buttons stay
                  // inside the grid and re-arm the preview via onFocus below.
                  if (
                    !event.currentTarget.contains(event.relatedTarget as Node)
                  ) {
                    onMonthHoverChange(null);
                  }
                }
              : undefined
          }
          className={clsx(
            withBaseName("grid"),
            getMonthRangeStatus
              ? "saltCalendarMonth-range"
              : "saltCalendarMonth-single",
          )}
        >
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <div
              role="row"
              aria-rowindex={rowIndex + 1}
              key={`row-${rowIndex}`}
              className={withBaseName("row")}
            >
              {months
                .slice(rowIndex * COLUMNS, rowIndex * COLUMNS + COLUMNS)
                .map((month, colIndex) => {
                  const index = rowIndex * COLUMNS + colIndex;
                  const shortLabel = dateAdapter.format(month, "MMM");
                  const fullLabel = dateAdapter.format(month, "MMMM YYYY");
                  const selected = isMonthSelected(month);
                  const rangeStatus = getMonthRangeStatus?.(month);
                  const {
                    selectedStart = false,
                    selectedEnd = false,
                    selectedSpan = false,
                    selectedSameDay = false,
                    hoveredStart = false,
                    hoveredEnd = false,
                    hoveredSpan = false,
                  } = rangeStatus ?? {};
                  const unselectableReason = isMonthUnselectable?.(month);
                  const isUnselectable = Boolean(unselectableReason);
                  const isFocusable = focusedIndex === index;
                  const isInteractive =
                    !disabled && !readOnly && !isUnselectable;
                  return (
                    <div
                      role="gridcell"
                      aria-colindex={colIndex + 1}
                      aria-selected={selected || undefined}
                      aria-disabled={isUnselectable || undefined}
                      key={shortLabel}
                      className={withBaseName("cell")}
                    >
                      <button
                        type="button"
                        ref={(node) => {
                          buttonRefs.current[index] = node;
                          if (isFocusable) {
                            assignFocusedButtonRef(node);
                          }
                        }}
                        // Unselectable months use aria-disabled instead of
                        // the native `disabled` attribute so they remain
                        // reachable via roving-tabindex/arrow-key navigation
                        // and can display a focus ring, matching the
                        // Calendar day pattern. The onClick handler is
                        // already gated by `isInteractive`.
                        disabled={disabled}
                        aria-disabled={isUnselectable || undefined}
                        aria-pressed={selected}
                        aria-label={
                          unselectableReason
                            ? monthYearPanelMessages.monthUnselectableAriaLabel(
                                fullLabel,
                                unselectableReason,
                              )
                            : fullLabel
                        }
                        tabIndex={isFocusable ? 0 : -1}
                        onClick={(event) => {
                          if (!isInteractive) return;
                          onFocusedIndexChange(index);
                          onMonthSelect(event, month);
                        }}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        onFocus={() => {
                          onFocusedIndexChange(index);
                          // Keyboard-driven roving focus doubles as a range
                          // preview trigger, mirroring mouse hover.
                          onMonthHoverChange?.(month);
                        }}
                        onMouseEnter={
                          onMonthHoverChange
                            ? () => onMonthHoverChange(month)
                            : undefined
                        }
                        className={clsx(withDayBaseName(), {
                          [withDayBaseName("selected")]:
                            selected && !getMonthRangeStatus,
                          [withDayBaseName("selectedStart")]: selectedStart,
                          [withDayBaseName("selectedEnd")]: selectedEnd,
                          [withDayBaseName("selectedSpan")]: selectedSpan,
                          [withDayBaseName("selectedSameDay")]: selectedSameDay,
                          [withDayBaseName("hoveredStart")]: hoveredStart,
                          [withDayBaseName("hoveredEnd")]: hoveredEnd,
                          [withDayBaseName("hoveredSpan")]: hoveredSpan,
                          [withDayBaseName("unselectable")]: isUnselectable,
                          [withDayBaseName("focused")]: isFocusable,
                        })}
                      >
                        <span
                          aria-hidden="true"
                          className={withDayBaseName("content")}
                        >
                          {shortLabel}
                        </span>
                      </button>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
