import {
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
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
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  type SingleDatePickerState,
  useDatePickerContext,
} from "../date-picker/DatePickerContext";
import { useDatePickerOverlay } from "../date-picker/DatePickerOverlayProvider";
import { useLocalization } from "../localization-provider";
import { MonthGrid, type MonthGridProps } from "./MonthGrid";
import monthYearPanelCss from "./MonthYearPanel.css";
import { monthYearPanelMessages } from "./messages";
import {
  buildMonthsForYear,
  isMonthOutOfRange,
  monthIndexOf,
  yearOf,
} from "./utils";

const withBaseName = makePrefixer("saltMonthYearPanel");

export interface MonthYearSinglePanelProps
  extends ComponentPropsWithoutRef<"div"> {
  /** Optional helper text rendered above the grid. */
  helperText?: ReactNode;
  /** Controlled year currently displayed. */
  visibleYear?: number;
  /** Default (uncontrolled) year – falls back to the selected year, else today. */
  defaultVisibleYear?: number;
  /** Fired whenever the visible year changes. */
  onVisibleYearChange?: (
    event: SyntheticEvent | null,
    visibleYear: number,
  ) => void;
  /**
   * Fired when the user picks a month (before the context `select` helper runs).
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    date: DateFrameworkType | null,
  ) => void;
  /**
   * Fine-grained "this month is not selectable" hook. Called for every rendered
   * month; return a reason string when the month should be disabled, `false`
   * otherwise. `minDate`/`maxDate` bounds are enforced automatically.
   */
  isMonthUnselectable?: (date: DateFrameworkType) => string | false | undefined;
  /**
   * Override the DatePicker context's `minDate`.
   */
  minDate?: DateFrameworkType;
  /**
   * Override the DatePicker context's `maxDate`.
   */
  maxDate?: DateFrameworkType;
  /** Props forwarded to the internal `MonthGrid`. */
  MonthGridProps?: Partial<
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
      | "minDate"
      | "maxDate"
      | "timezone"
      | "readOnly"
      | "disabled"
      | "isMonthUnselectable"
    >
  >;
}

export const MonthYearSinglePanel = forwardRef<
  HTMLDivElement,
  MonthYearSinglePanelProps
>(function MonthYearSinglePanel(props, ref) {
  const {
    className,
    helperText,
    visibleYear: visibleYearProp,
    defaultVisibleYear,
    onVisibleYearChange,
    onSelectionChange,
    isMonthUnselectable: isMonthUnselectableProp,
    minDate: minDateProp,
    maxDate: maxDateProp,
    MonthGridProps,
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
      selectedDate = null,
      timezone,
      readOnly,
      disabled,
      minDate: contextMinDate,
      maxDate: contextMaxDate,
    },
    helpers: { select },
  } = useDatePickerContext({
    selectionVariant: "single",
  }) as SingleDatePickerState;

  const overlayContext = useDatePickerOverlay();
  const initialFocusRef = overlayContext?.state?.initialFocusRef;
  const minDate = minDateProp ?? contextMinDate;
  const maxDate = maxDateProp ?? contextMaxDate;
  const minYear = minDate ? dateAdapter.getYear(minDate) : undefined;
  const maxYear = maxDate ? dateAdapter.getYear(maxDate) : undefined;

  const [visibleYear, setVisibleYearState] = useControlled<number>({
    controlled: visibleYearProp,
    default:
      defaultVisibleYear ??
      yearOf(dateAdapter, selectedDate, () =>
        dateAdapter.getYear(dateAdapter.today(timezone)),
      ),
    name: "MonthYearSinglePanel",
    state: "visibleYear",
  });

  const isMonthUnselectable = useCallback(
    (date: DateFrameworkType) => {
      if (isMonthOutOfRange(dateAdapter, date, minDate, maxDate)) {
        return monthYearPanelMessages.monthOutOfRange;
      }
      return isMonthUnselectableProp?.(date) ?? false;
    },
    [dateAdapter, isMonthUnselectableProp, maxDate, minDate],
  );

  const getNextFocusedIndex = (
    year: number,
    date: DateFrameworkType | null | undefined,
  ) => {
    const months = buildMonthsForYear(dateAdapter, year, timezone);
    const isMonthFocusable = (month: DateFrameworkType | null | undefined) =>
      month &&
      dateAdapter.isValid(month) &&
      dateAdapter.getYear(month) === year &&
      !isMonthUnselectable(months[monthIndexOf(dateAdapter, month, 0)]);

    if (isMonthFocusable(date)) {
      return monthIndexOf(dateAdapter, date, 0);
    }

    // Today
    const today = dateAdapter.today(timezone);
    if (isMonthFocusable(today)) {
      return monthIndexOf(dateAdapter, today, 0);
    }

    // First selectable month in the visible year
    const firstSelectableIndex = months.findIndex(
      (month) => !isMonthUnselectable(month),
    );
    return firstSelectableIndex === -1 ? 0 : firstSelectableIndex;
  };

  const [focusedIndex, setFocusedIndex] = useState<number>(() =>
    getNextFocusedIndex(visibleYear, selectedDate),
  );

  const handleVisibleYearChange = useCallback(
    (event: SyntheticEvent | null, nextYear: number) => {
      const clamped = Math.min(
        maxYear ?? Number.POSITIVE_INFINITY,
        Math.max(minYear ?? Number.NEGATIVE_INFINITY, nextYear),
      );
      setVisibleYearState(clamped);
      onVisibleYearChange?.(event, clamped);
    },
    [maxYear, minYear, onVisibleYearChange, setVisibleYearState],
  );

  // Sync the visible year with an externally-changing selection (e.g. the user
  // types a new value into the DatePicker input, or the parent updates the
  // controlled `selectedDate`). When the selection is cleared, reset the
  // roving-tabindex owner to the current or first selectable month.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only respond to selectedDate changes
  useIsomorphicLayoutEffect(() => {
    if (!selectedDate || !dateAdapter.isValid(selectedDate)) {
      setFocusedIndex(getNextFocusedIndex(visibleYear, null));
      return;
    }
    const nextYear = dateAdapter.getYear(selectedDate);
    if (nextYear !== visibleYear) {
      handleVisibleYearChange(null, nextYear);
    }
    setFocusedIndex(monthIndexOf(dateAdapter, selectedDate, 0));
  }, [selectedDate]);

  const isMonthSelected = useCallback(
    (date: DateFrameworkType) => {
      if (!selectedDate || !dateAdapter.isValid(selectedDate)) return false;
      return dateAdapter.isSame(date, selectedDate, "month");
    },
    [dateAdapter, selectedDate],
  );

  const handleMonthSelect = useCallback(
    (event: SyntheticEvent, date: DateFrameworkType) => {
      const normalised = dateAdapter.startOf(date, "month");
      // Commit to the DatePicker state before invoking the panel-level
      // `onSelectionChange` prop so downstream consumers observe the
      // freshly-committed selection. Matches DatePickerSingleGridPanel.
      select(event, normalised);
      onSelectionChange?.(event, normalised);
    },
    [dateAdapter, onSelectionChange, select],
  );

  const ariaLabel = useMemo(
    () => monthYearPanelMessages.gridLabel(visibleYear),
    [visibleYear],
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
      {/* Avoid Dropdowns in MonthGrid inheriting the FormField's state */}
      <FormFieldContext.Provider value={{} as FormFieldContextValue}>
        <MonthGrid
          ariaLabel={ariaLabel}
          year={visibleYear}
          onYearChange={handleVisibleYearChange}
          focusedIndex={focusedIndex}
          onFocusedIndexChange={setFocusedIndex}
          isMonthSelected={isMonthSelected}
          isMonthUnselectable={isMonthUnselectable}
          onMonthSelect={handleMonthSelect}
          focusedButtonRef={initialFocusRef}
          minYear={minYear}
          maxYear={maxYear}
          minDate={minDate}
          maxDate={maxDate}
          timezone={timezone}
          disabled={disabled}
          readOnly={readOnly}
          {...MonthGridProps}
        />
      </FormFieldContext.Provider>
    </StackLayout>
  );
});
