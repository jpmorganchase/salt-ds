import {
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
  useAriaAnnouncer,
  useControlled,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type MutableRefObject,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DateRangeSelection } from "../calendar";
import {
  type RangeDatePickerState,
  useDatePickerContext,
} from "../date-picker/DatePickerContext";
import { useDatePickerOverlay } from "../date-picker/DatePickerOverlayProvider";
import { useLocalization } from "../localization-provider";
import { MonthGrid, type MonthGridApi, type MonthGridProps } from "./MonthGrid";
import { monthYearPanelMessages } from "./messages";
import monthYearPanelCss from "./MonthYearPanel.css";
import { isMonthOutOfRange, monthIndexOf, yearOf } from "./utils";

const withBaseName = makePrefixer("saltMonthYearPanel");

export interface MonthYearRangePanelProps
  extends ComponentPropsWithoutRef<"div"> {
  helperText?: ReactNode;
  /** Controlled visible year for the start (left) grid. */
  startVisibleYear?: number;
  /** Controlled visible year for the end (right) grid. */
  endVisibleYear?: number;
  /** Uncontrolled initial visible year for the start grid. */
  defaultStartVisibleYear?: number;
  /** Uncontrolled initial visible year for the end grid. */
  defaultEndVisibleYear?: number;
  onStartVisibleYearChange?: (
    event: SyntheticEvent | null,
    visibleYear: number,
  ) => void;
  onEndVisibleYearChange?: (
    event: SyntheticEvent | null,
    visibleYear: number,
  ) => void;
  onSelectionChange?: (
    event: SyntheticEvent,
    date: DateRangeSelection | null,
  ) => void;
  isMonthUnselectable?: (date: DateFrameworkType) => string | false | undefined;
  minDate?: DateFrameworkType;
  maxDate?: DateFrameworkType;
  /** Props applied to the start (left) grid. */
  StartMonthGridProps?: Partial<
    Omit<
      MonthGridProps,
      | "year"
      | "onYearChange"
      | "focusedIndex"
      | "onFocusedIndexChange"
      | "isMonthSelected"
      | "onMonthSelect"
      | "focusedButtonRef"
      | "minYear"
      | "maxYear"
      | "timezone"
      | "readOnly"
      | "disabled"
      | "isMonthUnselectable"
    >
  >;
  /** Props applied to the end (right) grid. */
  EndMonthGridProps?: Partial<
    Omit<
      MonthGridProps,
      | "year"
      | "onYearChange"
      | "focusedIndex"
      | "onFocusedIndexChange"
      | "isMonthSelected"
      | "onMonthSelect"
      | "focusedButtonRef"
      | "minYear"
      | "maxYear"
      | "timezone"
      | "readOnly"
      | "disabled"
      | "isMonthUnselectable"
    >
  >;
}

export const MonthYearRangePanel = forwardRef<
  HTMLDivElement,
  MonthYearRangePanelProps
>(function MonthYearRangePanel(props, ref) {
  const {
    className,
    helperText,
    startVisibleYear,
    endVisibleYear,
    defaultStartVisibleYear,
    defaultEndVisibleYear,
    onStartVisibleYearChange,
    onEndVisibleYearChange,
    onSelectionChange,
    isMonthUnselectable: isMonthUnselectableProp,
    minDate: minDateProp,
    maxDate: maxDateProp,
    StartMonthGridProps,
    EndMonthGridProps,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-month-year-panel",
    css: monthYearPanelCss,
    window: targetWindow,
  });

  const { dateAdapter } = useLocalization();
  const {
    state: {
      selectedDate,
      timezone,
      readOnly,
      disabled,
      minDate: contextMinDate,
      maxDate: contextMaxDate,
    },
    helpers: { select },
  } = useDatePickerContext({
    selectionVariant: "range",
  }) as RangeDatePickerState;

  const overlayContext = useDatePickerOverlay();
  const initialFocusRef = overlayContext?.state?.initialFocusRef;
  const { announce } = useAriaAnnouncer();

  const minDate = minDateProp ?? contextMinDate;
  const maxDate = maxDateProp ?? contextMaxDate;
  const minYear = minDate ? dateAdapter.getYear(minDate) : undefined;
  const maxYear = maxDate ? dateAdapter.getYear(maxDate) : undefined;

  const derivedStartYear = yearOf(dateAdapter, selectedDate?.startDate, () =>
    dateAdapter.getYear(dateAdapter.today(timezone)),
  );
  // Default the end grid to the year AFTER the start so the two panels never
  // collide on the same year at initial mount. Clamp against maxYear up-front
  // so the useControlled default value can never seed the panel with an
  // out-of-bounds year — even for the single frame before the sync effect
  // runs. If min/max ultimately forbid the ideal layout, the reconcile step
  // below fixes it.
  const derivedEndYear = yearOf(dateAdapter, selectedDate?.endDate, () =>
    maxYear !== undefined
      ? Math.min(derivedStartYear + 1, maxYear)
      : derivedStartYear + 1,
  );

  const [visibleStartYear, setVisibleStartYearState] = useControlled<number>({
    controlled: startVisibleYear,
    default: defaultStartVisibleYear ?? derivedStartYear,
    name: "MonthYearRangePanel",
    state: "startVisibleYear",
  });
  const [visibleEndYear, setVisibleEndYearState] = useControlled<number>({
    controlled: endVisibleYear,
    default: defaultEndVisibleYear ?? derivedEndYear,
    name: "MonthYearRangePanel",
    state: "endVisibleYear",
  });

  const [startFocusedIndex, setStartFocusedIndex] = useState<number>(() =>
    monthIndexOf(dateAdapter, selectedDate?.startDate, 0),
  );
  const [endFocusedIndex, setEndFocusedIndex] = useState<number>(() =>
    monthIndexOf(dateAdapter, selectedDate?.endDate, 0),
  );

  /**
   * Currently-hovered month, used to preview the range while the user is
   * still selecting. Set by the MonthGrid mouse handlers and cleared when
   * the pointer leaves either grid.
   */
  const [hoveredMonth, setHoveredMonth] = useState<DateFrameworkType | null>(
    null,
  );

  // Imperative handles used to transfer keyboard focus between the two
  // grids when arrow-key navigation crosses the boundary of one panel.
  const startGridApiRef = useRef<MonthGridApi | null>(null);
  const endGridApiRef = useRef<MonthGridApi | null>(null);

  /**
   * On the start grid, moving forward past December normally hands focus
   * over to January on the end grid — but only when the two grids are
   * showing consecutive years. When there is a gap (e.g. start grid on
   * 2026, end grid on 2035 because the user navigated ahead), it's more
   * useful to advance this grid's own year, so we return `false` and let
   * the grid roll itself over. Backward past January is always a real
   * "go to the previous year" gesture on the first calendar.
   */
  const handleStartOutOfRange = useCallback(
    (direction: "forward" | "backward", targetIndex: number) => {
      if (
        direction === "forward" &&
        visibleEndYear === visibleStartYear + 1
      ) {
        endGridApiRef.current?.focusMonth(targetIndex);
        return true;
      }
      return false;
    },
    [visibleEndYear, visibleStartYear],
  );

  /**
   * Mirror image: on the end grid, moving backward past January hands
   * focus to December on the start grid only when the two grids are
   * showing consecutive years. Otherwise, roll this grid's year back.
   * Forward past December is always a real "go to the next year" gesture
   * on the last calendar.
   */
  const handleEndOutOfRange = useCallback(
    (direction: "forward" | "backward", targetIndex: number) => {
      if (
        direction === "backward" &&
        visibleEndYear === visibleStartYear + 1
      ) {
        startGridApiRef.current?.focusMonth(targetIndex);
        return true;
      }
      return false;
    },
    [visibleEndYear, visibleStartYear],
  );

  const clampYear = useCallback(
    (year: number) =>
      Math.min(
        maxYear ?? Number.POSITIVE_INFINITY,
        Math.max(minYear ?? Number.NEGATIVE_INFINITY, year),
      ),
    [maxYear, minYear],
  );

  /**
   * Enforce the "the two grids never show the same year" invariant on the
   * two visible years, respecting min/max. `priority` decides which side is
   * authoritative when the two collide:
   *   - "start": push the end forwards (start wins);
   *   - "end":   push the start backwards (end wins).
   * If min/max make it impossible to hold both sides strictly apart, the
   * priority side is preserved and the other is clamped as close as allowed.
   *
   * Selection is deliberately unaffected — a range may legitimately have
   * its start and end in the same calendar year; this constraint applies
   * only to what each grid displays.
   *
   * DEGENERATE CASE: when `minYear === maxYear` the invariant cannot hold
   * (only one year is allowed). Both grids will render the same year and
   * the visual highlight will overlap; consumers pinning min/max to a
   * single year should render `MonthYearSinglePanel` instead.
   */
  const reconcileYears = useCallback(
    (
      startYear: number,
      endYear: number,
      priority: "start" | "end",
    ): [number, number] => {
      const clampedStart = clampYear(startYear);
      const clampedEnd = clampYear(endYear);
      if (clampedEnd > clampedStart) return [clampedStart, clampedEnd];
      if (priority === "start") {
        const pushedEnd = clampYear(clampedStart + 1);
        if (pushedEnd > clampedStart) return [clampedStart, pushedEnd];
        // End is pinned to maxYear; back start off by one if allowed.
        const backedOffStart = clampYear(pushedEnd - 1);
        return [backedOffStart, pushedEnd];
      }
      const pushedStart = clampYear(clampedEnd - 1);
      if (pushedStart < clampedEnd) return [pushedStart, clampedEnd];
      // Start is pinned to minYear; push end forward by one if allowed.
      const pushedEnd = clampYear(pushedStart + 1);
      return [pushedStart, pushedEnd];
    },
    [clampYear],
  );

  const handleStartVisibleYearChange = useCallback(
    (event: SyntheticEvent | null, next: number) => {
      const [nextStart, nextEnd] = reconcileYears(
        next,
        visibleEndYear,
        "start",
      );
      if (nextStart !== visibleStartYear) {
        setVisibleStartYearState(nextStart);
        onStartVisibleYearChange?.(event, nextStart);
      }
      if (nextEnd !== visibleEndYear) {
        setVisibleEndYearState(nextEnd);
        onEndVisibleYearChange?.(event, nextEnd);
      }
    },
    [
      onEndVisibleYearChange,
      onStartVisibleYearChange,
      reconcileYears,
      setVisibleEndYearState,
      setVisibleStartYearState,
      visibleEndYear,
      visibleStartYear,
    ],
  );
  const handleEndVisibleYearChange = useCallback(
    (event: SyntheticEvent | null, next: number) => {
      const [nextStart, nextEnd] = reconcileYears(
        visibleStartYear,
        next,
        "end",
      );
      if (nextEnd !== visibleEndYear) {
        setVisibleEndYearState(nextEnd);
        onEndVisibleYearChange?.(event, nextEnd);
      }
      if (nextStart !== visibleStartYear) {
        setVisibleStartYearState(nextStart);
        onStartVisibleYearChange?.(event, nextStart);
      }
    },
    [
      onEndVisibleYearChange,
      onStartVisibleYearChange,
      reconcileYears,
      setVisibleEndYearState,
      setVisibleStartYearState,
      visibleEndYear,
      visibleStartYear,
    ],
  );

  // Keep the grids in sync when the selection changes from outside (e.g. the
  // user types in the range input, or the parent updates the controlled
  // selection). Both years are reconciled in a single pass so that a
  // simultaneous update to start and end never leaves the two grids showing
  // the same year (violating the `end > start` invariant).
  // biome-ignore lint/correctness/useExhaustiveDependencies: only respond to selectedDate changes
  useIsomorphicLayoutEffect(() => {
    const startDate = selectedDate?.startDate;
    const endDate = selectedDate?.endDate;
    const startYear =
      startDate && dateAdapter.isValid(startDate)
        ? dateAdapter.getYear(startDate)
        : undefined;
    const endYear =
      endDate && dateAdapter.isValid(endDate)
        ? dateAdapter.getYear(endDate)
        : undefined;

    let nextStart = visibleStartYear;
    let nextEnd = visibleEndYear;

    // Only re-anchor a grid when the newly-selected date's year is not
    // already visible in *either* grid. This prevents a click in the end
    // grid from unexpectedly jumping the start grid (or vice versa) —
    // the click only ever sets the selection, never re-frames the panels.
    if (
      startYear !== undefined &&
      startYear !== visibleStartYear &&
      startYear !== visibleEndYear
    ) {
      nextStart = startYear;
    }
    if (
      endYear !== undefined &&
      endYear !== visibleStartYear &&
      endYear !== visibleEndYear
    ) {
      nextEnd = endYear;
    }

    if (startDate && dateAdapter.isValid(startDate)) {
      setStartFocusedIndex(monthIndexOf(dateAdapter, startDate, 0));
    } else {
      // Selection was cleared — reset the roving tabindex to January so a
      // fresh open lands on a sensible default rather than the previous
      // selection's month.
      setStartFocusedIndex(0);
    }
    if (endDate && dateAdapter.isValid(endDate)) {
      setEndFocusedIndex(monthIndexOf(dateAdapter, endDate, 0));
    } else {
      setEndFocusedIndex(0);
    }

    // Always reconcile — even if `nextStart`/`nextEnd` match the current
    // visible years — so an initial `defaultSelectedDate` that has both
    // endpoints in the same calendar year still forces the two grids to
    // consecutive years.
    const priority: "start" | "end" =
      startDate && dateAdapter.isValid(startDate) ? "start" : "end";
    const [reconciledStart, reconciledEnd] = reconcileYears(
      nextStart,
      nextEnd,
      priority,
    );
    if (reconciledStart !== visibleStartYear) {
      setVisibleStartYearState(reconciledStart);
      onStartVisibleYearChange?.(null, reconciledStart);
    }
    if (reconciledEnd !== visibleEndYear) {
      setVisibleEndYearState(reconciledEnd);
      onEndVisibleYearChange?.(null, reconciledEnd);
    }
  }, [selectedDate?.startDate, selectedDate?.endDate]);

  const isMonthUnselectable = useCallback(
    (date: DateFrameworkType) => {
      if (isMonthOutOfRange(dateAdapter, date, minDate, maxDate)) {
        return monthYearPanelMessages.monthOutOfRange;
      }
      return isMonthUnselectableProp?.(date) ?? false;
    },
    [dateAdapter, isMonthUnselectableProp, maxDate, minDate],
  );

  /**
   * `aria-selected` (on the gridcell) and `aria-pressed` (on the button)
   * should fire for BOTH range endpoints regardless of which grid renders
   * them. Otherwise a cross-year range's start-month cell in the end grid
   * (and vice-versa) reads as unselected to assistive tech, even though it
   * is visually highlighted via the `saltCalendarDay-selectedStart` /
   * `-selectedEnd` classes.
   */
  const isMonthSelected = useCallback(
    (date: DateFrameworkType) => {
      const start = selectedDate?.startDate;
      const end = selectedDate?.endDate;
      if (start && dateAdapter.isValid(start) && dateAdapter.isSame(date, start, "month")) {
        return true;
      }
      if (end && dateAdapter.isValid(end) && dateAdapter.isSame(date, end, "month")) {
        return true;
      }
      return false;
    },
    [dateAdapter, selectedDate?.endDate, selectedDate?.startDate],
  );

  /**
   * Compute the range-selection status for a candidate month against the
   * currently-selected range. `selectedSpan` fires for any month strictly
   * between the start and end (in either grid, even across visible years),
   * matching the "in-between highlight" that CalendarDay renders for days.
   *
   * When the user has committed only one endpoint and is hovering to preview
   * the other, the resolver additionally reports `hoveredStart`/`hoveredEnd`/
   * `hoveredSpan` so the same visual pill previews the tentative range.
   */
  const getMonthRangeStatus = useCallback(
    (date: DateFrameworkType) => {
      const start = selectedDate?.startDate;
      const end = selectedDate?.endDate;
      const hasStart = !!(start && dateAdapter.isValid(start));
      const hasEnd = !!(end && dateAdapter.isValid(end));
      const isStart =
        hasStart && dateAdapter.isSame(date, start as DateFrameworkType, "month");
      const isEnd =
        hasEnd && dateAdapter.isSame(date, end as DateFrameworkType, "month");
      const sameMonth =
        hasStart &&
        hasEnd &&
        dateAdapter.isSame(
          start as DateFrameworkType,
          end as DateFrameworkType,
          "month",
        );
      // Compare month starts so year rollover works transparently.
      const monthStart = dateAdapter.startOf(date, "month");
      const rangeStart = hasStart
        ? dateAdapter.startOf(start as DateFrameworkType, "month")
        : undefined;
      const rangeEnd = hasEnd
        ? dateAdapter.startOf(end as DateFrameworkType, "month")
        : undefined;
      const afterStart =
        rangeStart !== undefined &&
        dateAdapter.compare(monthStart, rangeStart) > 0;
      const beforeEnd =
        rangeEnd !== undefined &&
        dateAdapter.compare(monthStart, rangeEnd) < 0;

      // Hover-preview: only kick in when exactly one endpoint is committed,
      // so we don't fight the confirmed selected range styling above.
      let hoveredStart = false;
      let hoveredEnd = false;
      let hoveredSpan = false;
      if (hoveredMonth && dateAdapter.isValid(hoveredMonth)) {
        const hoverStart = dateAdapter.startOf(hoveredMonth, "month");
        if (hasStart && !hasEnd) {
          // Start pinned; hovering picks a tentative end.
          if (
            rangeStart !== undefined &&
            dateAdapter.compare(hoverStart, rangeStart) >= 0
          ) {
            hoveredEnd = dateAdapter.compare(monthStart, hoverStart) === 0;
            hoveredSpan =
              dateAdapter.compare(monthStart, rangeStart) > 0 &&
              dateAdapter.compare(monthStart, hoverStart) < 0;
          }
        } else if (!hasStart && hasEnd) {
          // End pinned; hovering picks a tentative start.
          if (
            rangeEnd !== undefined &&
            dateAdapter.compare(hoverStart, rangeEnd) <= 0
          ) {
            hoveredStart = dateAdapter.compare(monthStart, hoverStart) === 0;
            hoveredSpan =
              dateAdapter.compare(monthStart, hoverStart) > 0 &&
              dateAdapter.compare(monthStart, rangeEnd) < 0;
          }
        }
      }

      return {
        selectedStart: isStart,
        selectedEnd: isEnd,
        selectedSpan: afterStart && beforeEnd,
        selectedSameDay: sameMonth && isStart,
        hoveredStart,
        hoveredEnd,
        hoveredSpan,
      };
    },
    [dateAdapter, hoveredMonth, selectedDate?.endDate, selectedDate?.startDate],
  );

  const announceRange = useCallback(
    (next: DateRangeSelection) => {
      const startText =
        next.startDate && dateAdapter.isValid(next.startDate)
          ? dateAdapter.format(next.startDate, "MMMM YYYY")
          : monthYearPanelMessages.noStartMonth;
      const endText =
        next.endDate && dateAdapter.isValid(next.endDate)
          ? dateAdapter.format(next.endDate, "MMMM YYYY")
          : monthYearPanelMessages.noEndMonth;
      announce(
        monthYearPanelMessages.selectedRangeAnnouncement(startText, endText),
      );
    },
    [announce, dateAdapter],
  );

  const handleSelect = useCallback(
    (event: SyntheticEvent, date: DateFrameworkType) => {
      // Range-selection semantics mirror Calendar's `selectDateRange`:
      //   • both dates already set  → picked month becomes the new start,
      //     end is cleared;
      //   • only start set and pick ≥ start (month-granular) → picked month
      //     becomes the end, completing the range;
      //   • otherwise (nothing set, or pick is earlier than the existing
      //     start) → picked month becomes the new start.
      // This lets the user select a new range in one gesture, or extend an
      // in-progress selection with either an earlier or later endpoint,
      // regardless of which grid was clicked.
      const monthStart = dateAdapter.startOf(date, "month");
      const monthEnd = dateAdapter.endOf(date, "month");
      const prevStart = selectedDate?.startDate ?? null;
      const prevEnd = selectedDate?.endDate ?? null;
      const hasPrevStart = !!(prevStart && dateAdapter.isValid(prevStart));
      const hasPrevEnd = !!(prevEnd && dateAdapter.isValid(prevEnd));
      // Normalise the previously-committed start to start-of-month so a
      // mid-month value coming from the input parser doesn't leak through
      // when the range is completed.
      const prevStartMonth = hasPrevStart
        ? dateAdapter.startOf(prevStart as DateFrameworkType, "month")
        : null;

      let next: DateRangeSelection;
      if (hasPrevStart && hasPrevEnd) {
        next = { startDate: monthStart, endDate: null };
      } else if (
        prevStartMonth !== null &&
        dateAdapter.compare(monthStart, prevStartMonth) >= 0
      ) {
        next = { startDate: prevStartMonth, endDate: monthEnd };
      } else {
        next = { startDate: monthStart, endDate: null };
      }

      // Match the ordering used by sibling day panels
      // (DatePickerSingleGridPanel / DatePickerRangePanel): commit to the
      // DatePicker state first so any consumer reading through the panel's
      // `onSelectionChange` callback sees the freshly-committed value.
      select(event, next);
      onSelectionChange?.(event, next);
      announceRange(next);
    },
    [
      announceRange,
      dateAdapter,
      onSelectionChange,
      select,
      selectedDate?.endDate,
      selectedDate?.startDate,
    ],
  );

  // Overlay's initialFocusRef should land on the start grid's focused button
  // when the overlay opens.
  const assignOverlayInitialFocus = useCallback(
    (node: HTMLElement | null) => {
      if (!initialFocusRef) return;
      if (typeof initialFocusRef === "function") {
        (initialFocusRef as (n: HTMLElement | null) => void)(node);
      } else {
        (initialFocusRef as MutableRefObject<HTMLElement | null>).current =
          node;
      }
    },
    [initialFocusRef],
  );
  const overlayInitialFocusFlag = useRef(false);
  const startFocusedButtonRef = useCallback(
    (node: HTMLElement | null) => {
      if (overlayInitialFocusFlag.current) return;
      overlayInitialFocusFlag.current = Boolean(node);
      assignOverlayInitialFocus(node);
    },
    [assignOverlayInitialFocus],
  );

  const startAriaLabel = useMemo(
    () => monthYearPanelMessages.startGridLabel(visibleStartYear),
    [visibleStartYear],
  );
  const endAriaLabel = useMemo(
    () => monthYearPanelMessages.endGridLabel(visibleEndYear),
    [visibleEndYear],
  );

  return (
    <StackLayout
      separators
      gap={0}
      className={clsx(withBaseName("container"), className)}
      ref={ref}
      {...rest}
    >
      {helperText != null && (
        <div className={withBaseName("helper")}>
          <FormFieldContext.Provider value={{} as FormFieldContextValue}>
            <FormFieldHelperText>{helperText}</FormFieldHelperText>
          </FormFieldContext.Provider>
        </div>
      )}
      <div className={withBaseName("rangeContainer")}>
        <MonthGrid
          ariaLabel={startAriaLabel}
          year={visibleStartYear}
          onYearChange={handleStartVisibleYearChange}
          focusedIndex={startFocusedIndex}
          onFocusedIndexChange={setStartFocusedIndex}
          isMonthSelected={isMonthSelected}
          getMonthRangeStatus={getMonthRangeStatus}
          isMonthUnselectable={isMonthUnselectable}
          onMonthSelect={handleSelect}
          onMonthHoverChange={setHoveredMonth}
          focusedButtonRef={startFocusedButtonRef}
          apiRef={startGridApiRef}
          onNavigateOutOfRange={handleStartOutOfRange}
          minYear={minYear}
          maxYear={maxYear}
          timezone={timezone}
          disabled={disabled}
          readOnly={readOnly}
          {...StartMonthGridProps}
        />
        <MonthGrid
          ariaLabel={endAriaLabel}
          year={visibleEndYear}
          onYearChange={handleEndVisibleYearChange}
          focusedIndex={endFocusedIndex}
          onFocusedIndexChange={setEndFocusedIndex}
          isMonthSelected={isMonthSelected}
          getMonthRangeStatus={getMonthRangeStatus}
          isMonthUnselectable={isMonthUnselectable}
          onMonthSelect={handleSelect}
          onMonthHoverChange={setHoveredMonth}
          apiRef={endGridApiRef}
          onNavigateOutOfRange={handleEndOutOfRange}
          minYear={minYear}
          maxYear={maxYear}
          timezone={timezone}
          disabled={disabled}
          readOnly={readOnly}
          {...EndMonthGridProps}
        />
      </div>
    </StackLayout>
  );
});
