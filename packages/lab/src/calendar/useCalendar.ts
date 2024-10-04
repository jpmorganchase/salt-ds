import {
  type DateValue,
  endOfMonth,
  endOfYear,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfYear,
  today,
} from "@internationalized/date";
import { useControlled } from "@salt-ds/core";
import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCurrentLocale } from "./formatDate";
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
interface UseCalendarBaseProps {
  /**
   * The default visible month.
   */
  defaultVisibleMonth?: DateValue;
  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;
  /**
   * Function to determine if a day is unselectable.
   * @param date - The date to check.
   * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
   */
  isDayUnselectable?: (date: DateValue) => string | false | undefined;
  /**
   * Function to determine if a day is highlighted.
   * @param date - The date to check.
   * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
   */
  isDayHighlighted?: (date: DateValue) => string | false | undefined;
  /**
   * Function to determine if a day is disabled.
   * @param date - The date to check.
   * @returns A string reason if the day is disabled, otherwise `false` or `undefined`.
   */
  isDayDisabled?: (date: DateValue) => string | false | undefined;
  /**
   * The currently visible month.
   */
  visibleMonth?: DateValue;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * The minimum selectable date.
   */
  minDate?: DateValue;
  /**
   * The maximum selectable date.
   */
  maxDate?: DateValue;
  /**
   * The time zone used for date calculations.
   */
  timeZone?: string;
  /**
   * The locale used for date formatting.
   */
  locale?: string;
}

/**
 * UseCalendar hook props for a single date selection Calendar.
 */
export interface UseCalendarSingleProps
  extends UseCalendarSelectionSingleProps,
    UseCalendarBaseProps {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * UseCalendar hook props for a date range selection Calendar.
 */
export interface UseCalendarRangeProps
  extends UseCalendarSelectionRangeProps,
    UseCalendarBaseProps {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * UseCalendar hook props for a multi-select Calendar.
 */
export interface UseCalendarMultiSelectProps
  extends UseCalendarSelectionMultiSelectProps,
    UseCalendarBaseProps {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
}

/**
 * UseCalendar hook props for an offset date selection Calendar.
 */
export interface UseCalendarOffsetProps
  extends UseCalendarSelectionOffsetProps,
    UseCalendarBaseProps {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
}

/**
 * UseCalendar hook props, wth the selection variant determining the return type of the date selection
 */
export type UseCalendarProps =
  | UseCalendarSingleProps
  | UseCalendarRangeProps
  | UseCalendarMultiSelectProps
  | UseCalendarOffsetProps;

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

export function useCalendar(props: UseCalendarProps) {
  const {
    selectedDate,
    defaultSelectedDate,
    visibleMonth: visibleMonthProp,
    hideOutOfRangeDates,
    timeZone = getLocalTimeZone(),
    locale = getCurrentLocale(),
    defaultVisibleMonth = today(timeZone),
    onSelectionChange,
    onVisibleMonthChange,
    isDayUnselectable = defaultIsDayUnselectable,
    isDayHighlighted = defaultIsDayHighlighted,
    isDayDisabled = defaultIsDayDisabled,
    minDate,
    maxDate,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: visibleMonthProp ? startOfMonth(visibleMonthProp) : undefined,
    default: startOfMonth(defaultVisibleMonth),
    name: "Calendar",
    state: "visibleMonth",
  });

  const isOutsideAllowedDates = useCallback(
    (date: DateValue) => {
      return (
        (minDate && date.compare(minDate) < 0) ||
        (maxDate && date.compare(maxDate) > 0)
      );
    },
    [maxDate, minDate],
  );

  const isOutsideAllowedMonths = useCallback(
    (date: DateValue) => {
      return (
        (minDate && endOfMonth(date).compare(minDate) < 0) ||
        (maxDate && startOfMonth(date).compare(maxDate) > 0)
      );
    },
    [minDate, maxDate],
  );

  const isOutsideAllowedYears = useCallback(
    (date: DateValue) => {
      return (
        (minDate && endOfYear(date).compare(minDate) < 0) ||
        (maxDate && startOfYear(date).compare(maxDate) > 0)
      );
    },
    [minDate, maxDate],
  );

  const isDaySelectable = useCallback(
    (date?: DateValue) =>
      !(
        date &&
        (isDayUnselectable(date) ||
          isDayDisabled(date) ||
          isOutsideAllowedDates(date))
      ),
    [isDayUnselectable, isDayDisabled, isOutsideAllowedDates],
  );

  const selectionManager = useCalendarSelection({
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
  } as UseCalendarSelectionProps);

  const [calendarFocused, setCalendarFocused] = useState(false);

  const isInVisibleMonth = useCallback(
    (date: DateValue | undefined | null): date is DateValue =>
      date != null && isSameMonth(date, visibleMonth),
    [visibleMonth],
  );

  const getInitialFocusedDate = useCallback(() => {
    const selectedDate = selectionManager.state.selectedDate;
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection(selectedDate)
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
        .sort((a, b) => a.compare(b));
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
    if (isDaySelectable(today(timeZone)) && isInVisibleMonth(today(timeZone))) {
      return today(timeZone);
    }
    const firstSelectableDate = generateDatesForMonth(visibleMonth).find(
      (visibleDay) => isDaySelectable(visibleDay),
    );
    if (firstSelectableDate) {
      return firstSelectableDate;
    }
    return null;
  }, [
    isInVisibleMonth,
    selectionVariant,
    selectionManager.state.selectedDate,
    timeZone,
    visibleMonth,
  ]);

  const [focusedDate, setFocusedDateState] = useState<DateValue | null>(
    getInitialFocusedDate,
  );

  const isDayVisible = useCallback(
    (date: DateValue) => {
      const startInsideDays = startOfMonth(visibleMonth);

      if (date.compare(startInsideDays) < 0) return false;

      const endInsideDays = endOfMonth(visibleMonth);

      return !(date.compare(endInsideDays) > 0);
    },
    [visibleMonth],
  );

  const setVisibleMonth = useCallback(
    (event: SyntheticEvent, newVisibleMonth: DateValue) => {
      setVisibleMonthState(newVisibleMonth);
      onVisibleMonthChange?.(event, newVisibleMonth);
    },
    [onVisibleMonthChange],
  );

  const setFocusedDate = useCallback(
    (event: SyntheticEvent, date: DateValue) => {
      if (
        !focusedDate ||
        isSameDay(date, focusedDate) ||
        isOutsideAllowedDates(date)
      )
        return;

      setFocusedDateState(date);

      const shouldTransition =
        !isDayVisible(date) &&
        isDaySelectable(date) &&
        !isOutsideAllowedDates(date);
      if (shouldTransition) {
        setVisibleMonth(event, startOfMonth(date));
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
    () => ({
      state: {
        visibleMonth,
        focusedDate,
        minDate,
        maxDate,
        selectionVariant,
        hideOutOfRangeDates,
        calendarFocused,
        timeZone,
        locale,
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
    }),
    [
      visibleMonth,
      focusedDate,
      minDate,
      maxDate,
      selectionVariant,
      hideOutOfRangeDates,
      calendarFocused,
      timeZone,
      locale,
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
