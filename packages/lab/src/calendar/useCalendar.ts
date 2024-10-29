import { useControlled } from "@salt-ds/core";
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { type DateFrameworkType, useLocalization } from "../date-adapters";
import { generateDatesForMonth } from "./internal/utils";
import {
  type UseCalendarSelectionMultiSelectProps,
  type UseCalendarSelectionOffsetProps,
  type UseCalendarSelectionProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  isDateRangeSelection,
  useCalendarSelection,
} from "./useCalendarSelection";

/**
 * Interface representing the base properties UseCalendar hook.
 */
interface UseCalendarBaseProps<TDate> {
  /**
   * The default visible month.
   */
  defaultVisibleMonth?: TDate;
  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (event: SyntheticEvent, visibleMonth: TDate) => void;
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
   * The currently visible month.
   */
  visibleMonth?: TDate;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * Locale for date formatting
   */
  locale?: any;
  /**
   * The minimum selectable date.
   */
  minDate?: TDate;
  /**
   * The maximum selectable date.
   */
  maxDate?: TDate;
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
 *
 * @template TDate - The type of the date object used in the calendar.
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
     * The locale used for date formatting.
     */
    locale: any;

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
     * Whether the calendar is currently focused.
     */
    calendarFocused: boolean;

    /**
     * Additional state properties from selectionManager.state.
     */
    [key: string]: any; // Use a more specific type if possible
  };

  /**
   * Helper functions for interacting with the calendar.
   */
  helpers: {
    /**
     * Sets the visible month in the calendar.
     *
     * @param event - The synthetic event triggering the change.
     * @param newVisibleMonth - The new visible month to set.
     */
    setVisibleMonth: (event: SyntheticEvent, newVisibleMonth: TDate) => void;

    /**
     * Sets the focused date in the calendar.
     *
     * @param event - The synthetic event triggering the change.
     * @param date - The new date to focus.
     */
    setFocusedDate: (event: SyntheticEvent, date: TDate) => void;

    /**
     * Sets whether the calendar is focused.
     *
     * @param focused - Whether the calendar should be focused.
     */
    setCalendarFocused: (focused: boolean) => void;

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
    selectedDate,
    defaultSelectedDate,
    visibleMonth: visibleMonthProp,
    hideOutOfRangeDates,
    locale,
    defaultVisibleMonth = dateAdapter.today(locale),
    onSelectionChange,
    onVisibleMonthChange,
    isDayUnselectable = defaultIsDayUnselectable,
    isDayHighlighted = defaultIsDayHighlighted,
    isDayDisabled = defaultIsDayDisabled,
    minDate = defaultMinDate,
    maxDate = defaultMaxDate,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: visibleMonthProp
      ? dateAdapter.startOf(visibleMonthProp, "month", locale)
      : undefined,
    default: dateAdapter.startOf(defaultVisibleMonth, "month", locale),
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
    [maxDate, minDate],
  );

  const isOutsideAllowedMonths = useCallback(
    (date: TDate) => {
      const startOfMonth = dateAdapter.startOf(date, "month", locale);
      const endOfMonth = dateAdapter.endOf(date, "month", locale);
      return (
        dateAdapter.compare(endOfMonth, minDate) < 0 ||
        dateAdapter.compare(startOfMonth, maxDate) > 0
      );
    },
    [minDate, maxDate],
  );

  const isOutsideAllowedYears = useCallback(
    (date: TDate) => {
      const startOfYear = dateAdapter.startOf(date, "year", locale);
      const endOfYear = dateAdapter.endOf(date, "year", locale);
      return (
        dateAdapter.compare(endOfYear, minDate) < 0 ||
        dateAdapter.compare(startOfYear, maxDate) > 0
      );
    },
    [minDate, maxDate],
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

  const selectionManager = useCalendarSelection<TDate>({
    defaultSelectedDate: defaultSelectedDate,
    selectedDate,
    onSelectionChange,
    startDateOffset:
      props.selectionVariant === "offset" ? props.startDateOffset : undefined,
    endDateOffset:
      props.selectionVariant === "offset" ? props.endDateOffset : undefined,
    isDaySelectable,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
  } as UseCalendarSelectionProps<TDate>);

  const [calendarFocused, setCalendarFocused] = useState(false);

  const isInVisibleMonth = useCallback(
    (date: TDate | undefined | null): date is TDate =>
      date != null && dateAdapter.isSame(date, visibleMonth, "month"),
    [visibleMonth],
  );

  const getInitialFocusedDate = useCallback(() => {
    const selectedDate = selectionManager.state.selectedDate;
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection<TDate>(selectedDate)
    ) {
      if (isInVisibleMonth(selectedDate?.startDate)) {
        return selectedDate.startDate;
      }
      if (isInVisibleMonth(selectedDate?.endDate)) {
        return selectedDate.endDate;
      }
    } else if (
      selectionVariant === "multiselect" &&
      Array.isArray(selectedDate)
    ) {
      // return first selected day in visible month
      const selectionInMonth = selectedDate
        .filter((day) => isInVisibleMonth(day))
        .sort((a, b) => dateAdapter.compare(a, b));
      if (selectionInMonth.length > 0) {
        return selectionInMonth[0];
      }
    } else if (
      selectionVariant === "single" &&
      !isDateRangeSelection(selectedDate) &&
      !Array.isArray(selectedDate) &&
      isInVisibleMonth(selectedDate)
    ) {
      return selectedDate;
    }
    // Defaults
    if (
      isDaySelectable(dateAdapter.today(locale)) &&
      isInVisibleMonth(dateAdapter.today(locale))
    ) {
      return dateAdapter.today(locale);
    }
    const firstSelectableDate = generateDatesForMonth(
      dateAdapter,
      visibleMonth,
    ).find((visibleDay) => isDaySelectable(visibleDay));
    if (firstSelectableDate) {
      return firstSelectableDate;
    }
    return null;
  }, [
    isInVisibleMonth,
    selectionVariant,
    selectionManager.state.selectedDate,
    visibleMonth,
  ]);

  const [focusedDate, setFocusedDateState] = useState<TDate | null>(
    getInitialFocusedDate,
  );

  const isDayVisible = useCallback(
    (date: TDate) => {
      const startInsideDays = dateAdapter.startOf(
        visibleMonth,
        "month",
        locale,
      );

      if (dateAdapter.compare(date, startInsideDays) < 0) return false;

      const endInsideDays = dateAdapter.endOf(visibleMonth, "month", locale);

      return !(dateAdapter.compare(date, endInsideDays) > 0);
    },
    [visibleMonth],
  );

  const setVisibleMonth = useCallback(
    (event: SyntheticEvent, newVisibleMonth: TDate) => {
      setVisibleMonthState(newVisibleMonth);
      onVisibleMonthChange?.(event, newVisibleMonth);
    },
    [onVisibleMonthChange],
  );

  const setFocusedDate = useCallback(
    (event: SyntheticEvent, date: TDate) => {
      if (
        !focusedDate ||
        dateAdapter.isSame(date, focusedDate, "day") ||
        isOutsideAllowedDates(date)
      )
        return;

      setFocusedDateState(date);

      const shouldTransition =
        !isDayVisible(date) &&
        isDaySelectable(date) &&
        !isOutsideAllowedDates(date);
      if (shouldTransition) {
        setVisibleMonth(event, dateAdapter.startOf(date, "month", locale));
      }
    },
    [
      focusedDate,
      isDaySelectable,
      isDayVisible,
      isOutsideAllowedDates,
      setVisibleMonth,
    ],
  );

  useEffect(() => {
    if (visibleMonth && focusedDate && !isDayVisible(focusedDate)) {
      const focusableDate = getInitialFocusedDate();
      if (focusableDate) {
        setFocusedDateState(focusableDate);
      }
    }
  }, [isDayVisible, focusedDate, getInitialFocusedDate, visibleMonth]);

  return useMemo(
    () =>
      ({
        state: {
          visibleMonth,
          focusedDate,
          locale,
          minDate,
          maxDate,
          selectionVariant,
          hideOutOfRangeDates,
          calendarFocused,
          ...selectionManager.state,
        },
        helpers: {
          setVisibleMonth,
          setFocusedDate,
          setCalendarFocused,
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
      focusedDate,
      locale,
      minDate,
      maxDate,
      selectionVariant,
      hideOutOfRangeDates,
      calendarFocused,
      setVisibleMonth,
      setFocusedDate,
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      isDayVisible,
      isOutsideAllowedDates,
      isOutsideAllowedMonths,
      isOutsideAllowedYears,
      selectionManager,
    ],
  );
}
