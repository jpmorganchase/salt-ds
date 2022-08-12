import { useControlled } from "@jpmorganchase/uitk-core";
import { SyntheticEvent, useRef, useState } from "react";
import {
  DateValue,
  endOfMonth,
  endOfYear,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfYear,
  today,
} from "@internationalized/date";
import {
  UseMultiSelectionCalendarProps,
  UseOffsetSelectionCalendarProps,
  UseRangeSelectionCalendarProps,
  useSelectionCalendar,
  useSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "./internal/useSelection";
import { formatDate } from "./internal/utils";

export type UnselectableInfo =
  | { emphasis: "high"; tooltip?: string }
  | { emphasis: "low" };

interface BaseUseCalendarProps {
  initialVisibleMonth?: DateValue;
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue
  ) => void;
  isDayUnselectable?: (date: DateValue) => UnselectableInfo | boolean;
  visibleMonth?: DateValue;
  hideOutOfRangeDates?: boolean;
  minDate?: DateValue;
  maxDate?: DateValue;
}

export type useCalendarProps = (
  | Omit<UseSingleSelectionCalendarProps, "isDaySelectable">
  | Omit<UseMultiSelectionCalendarProps, "isDaySelectable">
  | Omit<UseRangeSelectionCalendarProps, "isDaySelectable">
  | Omit<UseOffsetSelectionCalendarProps, "isDaySelectable">
) &
  BaseUseCalendarProps;

const defaultIsDayUnselectable = (): UnselectableInfo | boolean => false;

export function useCalendar(props: useCalendarProps) {
  const {
    selectedDate,
    initialSelectedDate,
    visibleMonth: visibleMonthProp,
    hideOutOfRangeDates,
    initialVisibleMonth = today(getLocalTimeZone()),
    onSelectedDateChange,
    onVisibleMonthChange,
    isDayUnselectable = defaultIsDayUnselectable,
    minDate,
    maxDate,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    // startDateOffset,
    // endDateOffset,
  } = props;

  const isDaySelectable = (date?: DateValue) =>
    !(date && isDayUnselectable(date));

  const selectionManager = useSelectionCalendar({
    initialSelectedDate,
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
  } as useSelectionCalendarProps);

  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: visibleMonthProp ? startOfMonth(visibleMonthProp) : undefined,
    default: startOfMonth(initialVisibleMonth),
    name: "Calendar",
    state: "visibleMonth",
  });

  const [focusedDate, setFocusedDateState] = useState<DateValue>(
    startOfMonth(visibleMonth)
  );

  const isDayVisible = (date: DateValue) => {
    const startInsideDays = startOfMonth(visibleMonth);

    if (date.compare(startInsideDays) < 0) return false;

    const endInsideDays = endOfMonth(visibleMonth);

    return !(date.compare(endInsideDays) > 0);
  };

  const isOutsideAllowedDates = (date: DateValue) => {
    return (
      (minDate != null && date.compare(minDate) < 0) ||
      (maxDate != null && date.compare(maxDate) > 0)
    );
  };

  const isOutsideAllowedMonths = (date: DateValue) => {
    return (
      (minDate != null && endOfMonth(date).compare(minDate) < 0) ||
      (maxDate != null && startOfMonth(date).compare(maxDate) > 0)
    );
  };

  const isOutsideAllowedYears = (date: DateValue) => {
    return (
      (minDate != null && endOfYear(date).compare(minDate) < 0) ||
      (maxDate != null && startOfYear(date).compare(maxDate) > 0)
    );
  };

  const setFocusedDate = (event: SyntheticEvent, date: DateValue) => {
    if (isSameDay(date, focusedDate) || isOutsideAllowedDates(date)) return;

    setFocusedDateState(date);

    const shouldTransition =
      !isDayVisible(date) &&
      isDaySelectable(date) &&
      !isOutsideAllowedDates(date);
    if (shouldTransition) {
      setVisibleMonth(event, startOfMonth(date));
    }
    setTimeout(() => {
      dayRefs.current[formatDate(date)]?.focus({ preventScroll: true });
    });
  };

  const setVisibleMonth = (
    event: SyntheticEvent,
    newVisibleMonth: DateValue
  ) => {
    setVisibleMonthState(newVisibleMonth);
    if (!isSameMonth(focusedDate, newVisibleMonth)) {
      setFocusedDateState(startOfMonth(newVisibleMonth));
    }
    onVisibleMonthChange?.(event, newVisibleMonth);
  };

  const dayRefs = useRef<Record<string, HTMLElement>>({});

  const registerDayRef = (date: DateValue, element: HTMLElement) => {
    dayRefs.current[formatDate(date)] = element;
  };

  return {
    state: {
      visibleMonth,
      focusedDate,
      minDate,
      maxDate,
      selectionVariant,
      hideOutOfRangeDates,
      ...selectionManager.state,
    },
    helpers: {
      setVisibleMonth,
      setFocusedDate,
      isDayUnselectable,
      isDayVisible,
      isOutsideAllowedDates,
      isOutsideAllowedMonths,
      isOutsideAllowedYears,
      ...selectionManager.helpers,
      registerDayRef,
    },
  };
}
