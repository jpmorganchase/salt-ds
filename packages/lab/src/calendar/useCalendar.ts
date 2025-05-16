import {
  type ResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
  useControlled,
} from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { type SyntheticEvent, useCallback, useEffect, useMemo } from "react";
import { useLocalization } from "../localization-provider";
import {
  type UseCalendarSelectionBaseProps,
  type UseCalendarSelectionMultiSelectProps,
  type UseCalendarSelectionOffsetProps,
  type UseCalendarSelectionProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  useCalendarSelection,
} from "./useCalendarSelection";

/**
 * Base properties for the UseCalendar hook.
 * @template TDate - The type of the date object.
 */
interface UseCalendarBaseProps<TDate>
  extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The default visible month.
   */
  defaultVisibleMonth?: TDate;
  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event or null if triggered by code.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (
    event: SyntheticEvent | null,
    visibleMonth: TDate,
  ) => void;
  /**
   * Function to determine if a day is unselectable.
   * @param date - The date to check.
   * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
   */
  isDayUnselectable?: (date: TDate) => string | false | undefined;
  /**
   * Function to determine if a day is highlighted.
   * @param date - The date to check.
   * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
   */
  isDayHighlighted?: (date: TDate) => string | false | undefined;
  /**
   * Function to determine if a day is disabled.
   * @param date - The date to check.
   * @returns A string reason if the day is disabled, otherwise `false` or `undefined`.
   */
  isDayDisabled?: (date: TDate) => string | false | undefined;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * The minimum selectable date.
   */
  minDate?: TDate;
  /**
   * The maximum selectable date.
   */
  maxDate?: TDate;
  /**
   * Number of visible months, maximum 12, defaults to 1.
   */
  numberOfVisibleMonths?: ResponsiveProp<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >;
}

/**
 * UseCalendar hook props for a single date selection Calendar.
 */
export interface UseCalendarSingleProps<TDate extends DateFrameworkType>
  extends UseCalendarSelectionSingleProps<TDate>,
    UseCalendarBaseProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * UseCalendar hook props for a date range selection Calendar.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarRangeProps<TDate extends DateFrameworkType>
  extends UseCalendarSelectionRangeProps<TDate>,
    UseCalendarBaseProps<TDate> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * UseCalendar hook props for a multi-select Calendar.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarMultiSelectProps<TDate extends DateFrameworkType>
  extends UseCalendarSelectionMultiSelectProps<TDate>,
    UseCalendarBaseProps<TDate> {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
}

/**
 * UseCalendar hook props for an offset date selection Calendar.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarOffsetProps<TDate extends DateFrameworkType>
  extends UseCalendarSelectionOffsetProps<TDate>,
    UseCalendarBaseProps<TDate> {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * UseCalendar hook props, wth the selection variant determining the return type of the date selection
 * @template TDate - The type of the date object.
 */
export type UseCalendarProps<TDate extends DateFrameworkType> =
  | UseCalendarSingleProps<TDate>
  | UseCalendarRangeProps<TDate>
  | UseCalendarMultiSelectProps<TDate>
  | UseCalendarOffsetProps<TDate>;

/**
 * Default function to determine if a day is unselectable.
 * @returns `false` indicating the day is selectable.
 */
const defaultIsDayUnselectable = (): string | false => false;

/**
 * Default function to determine if a day is highlighted.
 * @returns `false` indicating the day is not highlighted.
 */
const defaultIsDayHighlighted = (): string | false => false;

/**
 * Default function to determine if a day is disabled.
 * @returns `false` indicating the day is not disabled.
 */
const defaultIsDayDisabled = (): false => false;

/**
 * Represents the return type of the useCalendar hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarReturn<TDate extends DateFrameworkType> {
  /**
   * The state of the calendar.
   */
  state: {
    /**
     * The currently visible month in the calendar.
     */
    visibleMonth: TDate;

    /**
     * The currently focused date in the calendar, or null if no date is focused.
     */
    focusedDate: TDate | null;

    /**
     *  Focusable dates based on current state
     */
    focusableDates: TDate[];

    /**
     * The minimum selectable date in the calendar.
     */
    minDate: TDate;

    /**
     * The maximum selectable date in the calendar.
     */
    maxDate: TDate;

    /**
     * The selection variant of the calendar, indicating the type of selection allowed.
     */
    selectionVariant: "single" | "range" | "multiselect" | "offset";

    /**
     * Whether to hide dates that are out of the selectable range.
     */
    hideOutOfRangeDates?: boolean;

    /**
     * Number of visible months
     */
    numberOfVisibleMonths: number;
    /**
     * Specifies the timezone behavior:
     * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
     * - If set to "default", the default timezone of the date library will be used.
     * - If set to "system", the local system's timezone will be applied.
     * - If set to "UTC", the time will be returned in UTC.
     * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
     */
    timezone?: Timezone;
    /**
     * Additional state properties from selectionManager.state.
     */
    // biome-ignore lint/suspicious/noExplicitAny: user defined
    [key: string]: any; // Use a more specific type if possible
  };

  /**
   * Helper functions for interacting with the calendar.
   */
  helpers: {
    /**
     * Sets the visible month in the calendar.
     *
     * @param event - The synthetic event or null if triggered by code.
     * @param newVisibleMonth - The new visible month to set.
     */
    setVisibleMonth: (
      event: SyntheticEvent | null,
      newVisibleMonth: TDate,
    ) => void;

    /**
     * Sets the focused date in the calendar.
     *
     * @param event - The synthetic event or null if triggered by code.
     * @param date - The new date to focus.
     */
    setFocusedDate: (event: SyntheticEvent | null, date: TDate | null) => void;

    /**
     * Determines if a day is unselectable.
     *
     * @param date - The date to check.
     * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
     */
    isDayUnselectable: (date: TDate) => string | false | undefined;

    /**
     * Determines if a day is highlighted.
     *
     * @param date - The date to check.
     * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
     */
    isDayHighlighted: (date: TDate) => string | false | undefined;

    /**
     * Determines if a day is disabled.
     *
     * @param date - The date to check.
     * @returns A string reason if the day is disabled, otherwise `false` or `undefined`.
     */
    isDayDisabled: (date: TDate) => string | false | undefined;

    /**
     * Determines if a day is visible in the calendar.
     *
     * @param date - The date to check.
     * @returns `true` if the day is visible, otherwise `false`.
     */
    isDayVisible: (date: TDate) => boolean;

    /**
     * Determines if a date is outside the allowed date range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is outside the allowed range, otherwise `false`.
     */
    isOutsideAllowedDates: (date: TDate) => boolean;

    /**
     * Determines if a month is outside the allowed range.
     *
     * @param date - The date to check.
     * @returns `true` if the month is outside the allowed range, otherwise `false`.
     */
    isOutsideAllowedMonths: (date: TDate) => boolean;

    /**
     * Determines if a year is outside the allowed range.
     *
     * @param date - The date to check.
     * @returns `true` if the year is outside the allowed range, otherwise `false`.
     */
    isOutsideAllowedYears: (date: TDate) => boolean;

    /**
     * Sets the selected date in the calendar.
     *
     * @param event - The event triggering the change.
     * @param newSelectedDate - The new date to select.
     */
    setSelectedDate: (
      event:
        | React.KeyboardEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLButtonElement, MouseEvent>,
      newSelectedDate: TDate,
    ) => void;

    /**
     * Determines if a date is selected.
     *
     * @param date - The date to check.
     * @returns `true` if the date is selected, otherwise `false`.
     */
    isSelected: (date: TDate) => boolean;

    /**
     * Sets the hovered date in the calendar.
     *
     * @param event - The event triggering the change.
     * @param newHoveredDate - The new date to hover.
     */
    setHoveredDate: (
      event: SyntheticEvent,
      newHoveredDate: TDate | null,
    ) => void;

    /**
     * Determines if a date is part of a selected span.
     *
     * @param date - The date to check.
     * @returns `true` if the date is part of a selected span, otherwise `false`.
     */
    isSelectedSpan: (date: TDate) => boolean;

    /**
     * Determines if a date is part of a hovered span.
     *
     * @param date - The date to check.
     * @returns `true` if the date is part of a hovered span, otherwise `false`.
     */
    isHoveredSpan: (date: TDate) => boolean;

    /**
     * Determines if a date is the start of a selected range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the start of a selected range, otherwise `false`.
     */
    isSelectedStart: (date: TDate) => boolean;

    /**
     * Determines if a date is the end of a selected range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the end of a selected range, otherwise `false`.
     */
    isSelectedEnd: (date: TDate) => boolean;

    /**
     * Determines if a date is hovered.
     *
     * @param date - The date to check.
     * @returns `true` if the date is hovered, otherwise `false`.
     */
    isHovered: (date: TDate) => boolean;

    /**
     * Determines if a date is part of a hovered offset.
     *
     * @param date - The date to check.
     * @returns `true` if the date is part of a hovered offset, otherwise `false`.
     */
    isHoveredOffset: (date: TDate) => boolean;

    /**
     * Determines if a day is selectable.
     *
     * @param date - The date to check.
     * @returns `true` if the day is selectable, otherwise `false`.
     */
    isDaySelectable: (date: TDate) => boolean;
  };
}

export function useCalendar<TDate extends DateFrameworkType>(
  props: UseCalendarProps<TDate>,
): UseCalendarReturn<TDate> {
  const {
    dateAdapter,
    defaultDates: { minDate: defaultMinDate, maxDate: defaultMaxDate },
  } = useLocalization<TDate>();
  const {
    timezone,
    defaultSelectedDate,
    defaultVisibleMonth = dateAdapter.today(timezone),
    hideOutOfRangeDates,
    hoveredDate,
    focusedDate: focusedDateProp,
    focusedDateRef,
    isDayDisabled = defaultIsDayDisabled,
    isDayHighlighted = defaultIsDayHighlighted,
    isDayUnselectable = defaultIsDayUnselectable,
    maxDate = defaultMaxDate,
    minDate = defaultMinDate,
    numberOfVisibleMonths = 1,
    onHoveredDateChange,
    onSelectionChange,
    onVisibleMonthChange,
    onFocusedDateChange,
    selectedDate,
    selectionVariant,
    visibleMonth: visibleMonthProp,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const { matchedBreakpoints } = useBreakpoint();

  const responsiveNumberOfVisibleMonths =
    resolveResponsiveValue(numberOfVisibleMonths, matchedBreakpoints) ?? 1;

  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: visibleMonthProp
      ? dateAdapter.startOf(visibleMonthProp, "month")
      : undefined,
    // biome-ignore lint/correctness/useExhaustiveDependencies: just on mount
    default: useMemo(
      () => dateAdapter.startOf(defaultVisibleMonth, "month"),
      [],
    ),
    name: "Calendar",
    state: "visibleMonth",
  });

  const isOutsideAllowedDates = useCallback(
    (date: TDate) => {
      return (
        dateAdapter.compare(date, minDate) < 0 ||
        dateAdapter.compare(date, maxDate) > 0
      );
    },
    [dateAdapter, maxDate, minDate],
  );

  const isOutsideAllowedMonths = useCallback(
    (date: TDate) => {
      const startOfMonth = dateAdapter.startOf(date, "month");
      const endOfMonth = dateAdapter.endOf(date, "month");
      return (
        dateAdapter.compare(endOfMonth, minDate) < 0 ||
        dateAdapter.compare(startOfMonth, maxDate) > 0
      );
    },
    [dateAdapter, minDate, maxDate],
  );

  const isOutsideAllowedYears = useCallback(
    (date: TDate) => {
      const startOfYear = dateAdapter.startOf(date, "year");
      const endOfYear = dateAdapter.endOf(date, "year");
      return (
        dateAdapter.compare(endOfYear, minDate) < 0 ||
        dateAdapter.compare(startOfYear, maxDate) > 0
      );
    },
    [dateAdapter, minDate, maxDate],
  );

  const isDaySelectable = useCallback(
    (date?: TDate) =>
      !(
        date &&
        (isDayUnselectable(date) ||
          isDayDisabled(date) ||
          isOutsideAllowedDates(date))
      ),
    [isDayUnselectable, isDayDisabled, isOutsideAllowedDates],
  );

  const isDayVisible = useCallback(
    (date?: TDate | null) => {
      if (!date) {
        return false;
      }
      const startInsideDays = dateAdapter.startOf(visibleMonth, "month");

      if (dateAdapter.compare(date, startInsideDays) < 0) return false;

      const endVisibleMonth = dateAdapter.add(visibleMonth, {
        months: responsiveNumberOfVisibleMonths - 1,
      });
      const endInsideDays = dateAdapter.endOf(endVisibleMonth, "month");

      return !(dateAdapter.compare(date, endInsideDays) > 0);
    },
    [dateAdapter, responsiveNumberOfVisibleMonths, visibleMonth],
  );

  const selectionManager = useCalendarSelection<TDate>({
    defaultSelectedDate,
    selectedDate,
    onSelectionChange,
    startDateOffset:
      props.selectionVariant === "offset" ? props.startDateOffset : undefined,
    endDateOffset:
      props.selectionVariant === "offset" ? props.endDateOffset : undefined,
    isOutsideAllowedDates,
    isDaySelectable,
    isDayVisible,
    focusedDate: focusedDateProp,
    focusedDateRef,
    onFocusedDateChange,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    timezone,
    visibleMonth,
  } as UseCalendarSelectionProps<TDate>);

  // biome-ignore lint/correctness/useExhaustiveDependencies: isDayVisible ignored (due to dependency on visibleMonth)
  useEffect(() => {
    const focusedDate = selectionManager?.state?.focusedDate;
    const shouldTransition =
      focusedDate &&
      !focusedDateProp !== undefined &&
      !isDayVisible(focusedDate) &&
      isDaySelectable(focusedDate) &&
      !isOutsideAllowedDates(focusedDate);

    if (shouldTransition) {
      setVisibleMonth(null, dateAdapter.startOf(focusedDate, "month"));
    }
  }, [
    dateAdapter,
    focusedDateProp,
    isOutsideAllowedDates,
    isDaySelectable,
    selectionManager?.state?.focusedDate,
  ]);

  const setVisibleMonth = useCallback(
    (event: SyntheticEvent | null, newVisibleMonth: TDate) => {
      setVisibleMonthState(newVisibleMonth);
      onVisibleMonthChange?.(event, newVisibleMonth);
    },
    [onVisibleMonthChange],
  );

  return useMemo(
    () =>
      ({
        state: {
          visibleMonth,
          timezone,
          minDate,
          maxDate,
          numberOfVisibleMonths: responsiveNumberOfVisibleMonths,
          selectionVariant,
          hideOutOfRangeDates,
          ...selectionManager.state,
        },
        helpers: {
          setVisibleMonth,
          isDayUnselectable,
          isDayHighlighted,
          isDayDisabled,
          isDayVisible,
          isOutsideAllowedDates,
          isOutsideAllowedMonths,
          isOutsideAllowedYears,
          ...selectionManager.helpers,
        },
      }) as UseCalendarReturn<TDate>,
    [
      visibleMonth,
      timezone,
      minDate,
      maxDate,
      selectionVariant,
      hideOutOfRangeDates,
      setVisibleMonth,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      isDayVisible,
      isOutsideAllowedDates,
      isOutsideAllowedMonths,
      isOutsideAllowedYears,
      responsiveNumberOfVisibleMonths,
      selectionManager,
    ],
  );
}
