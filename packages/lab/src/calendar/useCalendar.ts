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
import { type SyntheticEvent, useCallback, useEffect, useState } from "react";
import { getCurrentLocale } from "./formatDate";
import {
  type UseCalendarSelectionMultiSelectProps,
  type UseCalendarSelectionOffsetProps,
  type UseCalendarSelectionProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  isDateRangeSelection,
  useCalendarSelection,
} from "./useCalendarSelection";

interface UseCalendarBaseProps {
  defaultVisibleMonth?: DateValue;
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;
  isDayUnselectable?: (date: DateValue) => string | false | void;
  isDayHighlighted?: (date: DateValue) => string | false | void;
  isDayDisabled?: (date: DateValue) => boolean;
  visibleMonth?: DateValue;
  hideOutOfRangeDates?: boolean;
  minDate?: DateValue;
  maxDate?: DateValue;
  timeZone?: string;
  locale?: string;
}

export interface UseCalendarSingleProps
  extends UseCalendarSelectionSingleProps,
    UseCalendarBaseProps {
  selectionVariant: "single";
}
export interface UseCalendarRangeProps
  extends UseCalendarSelectionRangeProps,
    UseCalendarBaseProps {
  selectionVariant: "range";
}
export interface UseCalendarMultiSelectProps
  extends UseCalendarSelectionMultiSelectProps,
    UseCalendarBaseProps {
  selectionVariant: "multiselect";
}
export interface UseCalendarOffsetProps
  extends UseCalendarSelectionOffsetProps,
    UseCalendarBaseProps {
  selectionVariant: "offset";
}

export type UseCalendarProps =
  | UseCalendarSingleProps
  | UseCalendarRangeProps
  | UseCalendarMultiSelectProps
  | UseCalendarOffsetProps;

const defaultIsDayUnselectable = (): string | false => false;
const defaultIsDayHighlighted = (): string | false => false;
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
    onSelectedDateChange,
    onVisibleMonthChange,
    isDayUnselectable = defaultIsDayUnselectable,
    isDayHighlighted = defaultIsDayHighlighted,
    isDayDisabled = defaultIsDayDisabled,
    minDate,
    maxDate,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    select,
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

  const isOutsideAllowedMonths = (date: DateValue) => {
    return (
      (minDate && endOfMonth(date).compare(minDate) < 0) ||
      (maxDate && startOfMonth(date).compare(maxDate) > 0)
    );
  };

  const isOutsideAllowedYears = (date: DateValue) => {
    return (
      (minDate && endOfYear(date).compare(minDate) < 0) ||
      (maxDate && startOfYear(date).compare(maxDate) > 0)
    );
  };

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
    onSelectedDateChange,
    startDateOffset:
      props.selectionVariant === "offset"
        ? props.startDateOffset
        : (date) => date,
    endDateOffset:
      props.selectionVariant === "offset"
        ? props.endDateOffset
        : (date) => date,
    isDaySelectable,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    select,
  } as UseCalendarSelectionProps);

  const [calendarFocused, setCalendarFocused] = useState(false);

  const isInVisibleMonth = (
    date: DateValue | undefined | null,
  ): date is DateValue => date != null && isSameMonth(date, visibleMonth);

  const getInitialFocusedDate = (): DateValue => {
    const selectedDate = selectionManager.state.selectedDate;
    // Case range or offset
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
      if (
        selectedDate?.startDate &&
        selectedDate?.endDate &&
        visibleMonth.compare(selectedDate.startDate) < 0 &&
        visibleMonth.compare(selectedDate.endDate) > 0
      ) {
        return startOfMonth(visibleMonth);
      }
    }
    // Case multiselect
    if (selectionVariant === "multiselect" && Array.isArray(selectedDate)) {
      // return first selected day in visible month
      const selectionInMonth = selectedDate
        .filter((day) => isInVisibleMonth(day))
        .sort((a, b) => a.compare(b));
      if (selectionInMonth.length > 0) {
        return selectionInMonth[0];
      }
    }
    // Case single select
    if (
      selectionVariant === "single" &&
      !isDateRangeSelection(selectedDate) &&
      !Array.isArray(selectedDate) &&
      isInVisibleMonth(selectedDate)
    ) {
      return selectedDate;
    }
    // default
    if (isInVisibleMonth(today(timeZone))) {
      return today(timeZone);
    }
    return startOfMonth(visibleMonth);
  };

  const [focusedDate, setFocusedDateState] = useState<DateValue>(
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
    [onVisibleMonthChange, setVisibleMonthState],
  );

  const setFocusedDate = useCallback(
    (event: SyntheticEvent, date: DateValue) => {
      if (isSameDay(date, focusedDate) || isOutsideAllowedDates(date)) return;

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
    if (!isDayVisible(focusedDate)) {
      setFocusedDateState(getInitialFocusedDate());
    }
  }, [isDayVisible, focusedDate, visibleMonth]);

  return {
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
  };
}
