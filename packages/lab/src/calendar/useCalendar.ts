import { useControlled } from "@jpmorganchase/uitk-core";
import { SyntheticEvent, useRef, useState } from "react";
import dayjs from "./internal/dayjs";
import {
  UseMultiSelectionCalendarProps,
  UseOffsetSelectionCalendarProps,
  UseRangeSelectionCalendarProps,
  useSelectionCalendar,
  useSelectionCalendarProps,
  UseSingleSelectionCalendarProps,
} from "./internal/useSelection";

export type UnselectableInfo =
  | { emphasis: "high"; tooltip?: string }
  | { emphasis: "low" };

interface BaseUseCalendarProps {
  initialVisibleMonth?: Date;
  onVisibleMonthChange?: (event: SyntheticEvent, visibleMonth: Date) => void;
  isDayUnselectable?: (date: Date) => UnselectableInfo | boolean;
  visibleMonth?: Date;
  firstDayOfWeek?: number;
  hideOutOfRangeDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
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
    initialVisibleMonth = dayjs().startOf("month").toDate(),
    onSelectedDateChange,
    onVisibleMonthChange,
    firstDayOfWeek = 1,
    isDayUnselectable = defaultIsDayUnselectable,
    minDate,
    maxDate,
    selectionVariant,
    onHoveredDateChange,
    hoveredDate,
    // startDateOffset,
    // endDateOffset,
  } = props;

  const isDaySelectable = (date?: Date) => !(date && isDayUnselectable(date));

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

  dayjs.updateLocale(dayjs.locale(), { weekStart: firstDayOfWeek });

  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: visibleMonthProp
      ? dayjs(visibleMonthProp).startOf("month").toDate()
      : undefined,
    default: dayjs(initialVisibleMonth).startOf("month").toDate(),
    name: "Calendar",
    state: "visibleMonth",
  });

  const [focusedDate, setFocusedDateState] = useState<Date>(
    dayjs(visibleMonth).startOf("month").toDate()
  );

  const isDayVisible = (date: Date) => {
    const startInsideDays = dayjs(visibleMonth).startOf("month");

    if (dayjs(date).isBefore(startInsideDays, "day")) return false;

    const endInsideDays = dayjs(visibleMonth).endOf("month");

    return !dayjs(date).isAfter(endInsideDays, "day");
  };

  const isDateNavigable = (date: Date, type: "month" | "year") => {
    if (minDate && dayjs(date).isBefore(dayjs(minDate), type)) {
      return false;
    }

    if (maxDate && dayjs(date).isAfter(dayjs(maxDate), type)) {
      return false;
    }

    return true;
  };

  const setFocusedDate = (event: SyntheticEvent, date: Date) => {
    if (
      dayjs(date).isSame(focusedDate, "day") ||
      !isDateNavigable(date, "month")
    )
      return;

    setFocusedDateState(date);

    const shouldTransition =
      !isDayVisible(date) &&
      isDaySelectable(date) &&
      isDateNavigable(date, "month");
    if (shouldTransition) {
      setVisibleMonth(event, dayjs(date).startOf("month").toDate());
    }
    setTimeout(() => {
      dayRefs.current[dayjs(date).format("L")]?.focus({ preventScroll: true });
    });
  };

  const setVisibleMonth = (event: SyntheticEvent, newVisibleMonth: Date) => {
    setVisibleMonthState(newVisibleMonth);
    if (!dayjs(focusedDate).isSame(newVisibleMonth, "month")) {
      setFocusedDateState(dayjs(newVisibleMonth).startOf("month").toDate());
    }
    onVisibleMonthChange?.(event, newVisibleMonth);
  };

  const dayRefs = useRef<Record<string, HTMLElement>>({});

  const registerDayRef = (date: Date, element: HTMLElement) => {
    dayRefs.current[dayjs(date).format("L")] = element;
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
      isDateNavigable,
      ...selectionManager.helpers,
      registerDayRef,
    },
  };
}
