import {
  CalendarDate,
  type DateValue,
  isSameDay,
} from "@internationalized/date";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";

export type SingleDateSelection = DateValue;
export type MultipleDateSelection = DateValue[];
export type DateRangeSelection = {
  startDate?: DateValue;
  endDate?: DateValue;
};
export type AllSelectionValueType =
  | SingleDateSelection
  | MultipleDateSelection
  | DateRangeSelection
  | null;

export const CALENDAR_MIN_YEAR = 1900;
export const CALENDAR_MAX_YEAR = 2100;

export function isSingleSelectionValueType(value: any): value is DateValue {
  return value instanceof CalendarDate;
}

export function isDateRangeSelection(value: any): value is DateRangeSelection {
  return (
    value &&
    typeof value === "object" &&
    ("startDate" in value || "endDate" in value)
  );
}

export function isMultipleDateSelection(
  value: any,
): value is MultipleDateSelection {
  return (
    Array.isArray(value) && value.every((item) => item instanceof CalendarDate)
  );
}

interface UseCalendarSelectionBaseProps<SelectionVariantType> {
  hoveredDate?: DateValue | null;
  selectedDate?: SelectionVariantType | null;
  defaultSelectedDate?: SelectionVariantType;
  onSelectedDateChange?: (
    event: SyntheticEvent,
    selectedDate: SelectionVariantType | null,
  ) => void;
  isDaySelectable?: (date: DateValue) => boolean;
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: DateValue | null,
  ) => void;
  select?: (
    currentSelectedDate: SelectionVariantType,
    newSelectedDate: DateValue,
  ) => SelectionVariantType;
}

export interface UseCalendarSelectionOffsetProps
  extends Omit<
    UseCalendarSelectionBaseProps<DateRangeSelection>,
    "startDateOffset" | "endDateOffset"
  > {
  selectionVariant: "offset";
  startDateOffset?: (date: DateValue) => DateValue;
  endDateOffset?: (date: DateValue) => DateValue;
}

export interface UseCalendarSelectionRangeProps
  extends UseCalendarSelectionBaseProps<DateRangeSelection> {
  selectionVariant: "range";
}

export interface UseCalendarSelectionMultiSelectProps
  extends UseCalendarSelectionBaseProps<MultipleDateSelection> {
  selectionVariant: "multiselect";
}

export interface UseCalendarSelectionSingleProps
  extends UseCalendarSelectionBaseProps<SingleDateSelection> {
  selectionVariant: "single";
}

export type UseCalendarSelectionProps =
  | UseCalendarSelectionSingleProps
  | UseCalendarSelectionMultiSelectProps
  | UseCalendarSelectionRangeProps
  | UseCalendarSelectionOffsetProps;

function addOrRemoveFromArray(
  array: AllSelectionValueType = [],
  item: DateValue,
) {
  if (Array.isArray(array)) {
    if (array.find((element) => isSameDay(element, item))) {
      return array.filter((element) => !isSameDay(element, item));
    }
    return array.concat(item);
  }
  return [item];
}

const defaultOffset = (date: DateValue) => date;

const withBaseName = makePrefixer("saltCalendarDay");

const defaultSingleSelectionHandler = (
  _currentSelectedDate: DateValue,
  newSelectedDate: DateValue,
): DateValue => {
  return newSelectedDate;
};

const defaultMultiSelectHandler = (
  currentSelectedDate: DateValue[],
  newSelectedDate: DateValue,
): DateValue[] => {
  return addOrRemoveFromArray(currentSelectedDate, newSelectedDate);
};

const defaultRangeSelectionHandler = (
  currentSelectedDate: DateRangeSelection,
  newSelectedDate: DateValue,
): DateRangeSelection => {
  let base = { ...currentSelectedDate };
  if (base?.startDate && base?.endDate) {
    base = { startDate: newSelectedDate };
  } else if (base?.startDate && newSelectedDate.compare(base.startDate) < 0) {
    base = { startDate: newSelectedDate };
  } else if (base?.startDate && newSelectedDate.compare(base.startDate) >= 0) {
    base = { ...base, endDate: newSelectedDate };
  } else {
    base = { startDate: newSelectedDate };
  }
  return base;
};

const defaultOffsetSelectionHandler = (
  _currentSelectedDate: DateRangeSelection,
  newSelectedDate: DateValue,
): DateRangeSelection => {
  return {
    startDate: newSelectedDate,
    endDate: newSelectedDate,
  };
};

export function useCalendarSelection(props: UseCalendarSelectionProps) {
  const {
    hoveredDate: hoveredDateProp,
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    // onSelectedDateChange,
    onHoveredDateChange,
    isDaySelectable,
    selectionVariant,
    select: selectProp,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const [selectedDate, setSelectedDateState] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "Calendar",
    state: "selectedDate",
  });

  const getStartDateOffset = (date: DateValue) => {
    if (props.selectionVariant === "offset" && props.startDateOffset) {
      return props.startDateOffset(date);
    } else {
      return defaultOffset(date);
    }
  };

  const getEndDateOffset = (date: DateValue) => {
    if (props.selectionVariant === "offset" && props.endDateOffset) {
      return props.endDateOffset(date);
    } else {
      return defaultOffset(date);
    }
  };

  const setSelectedDate = (
    event: SyntheticEvent<HTMLButtonElement>,
    newSelectedDate: DateValue,
  ) => {
    if (!isDaySelectable || isDaySelectable(newSelectedDate)) {
      switch (selectionVariant) {
        case "single":
          const singleSelect = selectProp || defaultSingleSelectionHandler;
          const newSingleDate = singleSelect(
            selectedDate as DateValue,
            newSelectedDate,
          );
          setSelectedDateState(newSingleDate);
          props.onSelectedDateChange?.(event, newSingleDate);
          break;
        case "multiselect":
          const multiSelect = selectProp || defaultMultiSelectHandler;
          const newMultiSelectDate = multiSelect(
            selectedDate as DateValue[],
            newSelectedDate,
          );
          setSelectedDateState(newMultiSelectDate);
          props.onSelectedDateChange?.(event, newMultiSelectDate);
          break;
        case "range":
          const rangeSelect = selectProp || defaultRangeSelectionHandler;
          const newRangeDate = rangeSelect(
            selectedDate as DateRangeSelection,
            newSelectedDate,
          );
          setSelectedDateState(newRangeDate);
          props.onSelectedDateChange?.(event, newRangeDate);
          break;
        case "offset":
          const offsetSelect = selectProp || defaultOffsetSelectionHandler;
          const newOffsetDate = offsetSelect(
            selectedDate as DateRangeSelection,
            newSelectedDate,
          );
          setSelectedDateState(newOffsetDate);
          props.onSelectedDateChange?.(event, newOffsetDate);
          break;
      }
    }
  };

  const isSelected = (date: DateValue) => {
    switch (selectionVariant) {
      case "single":
        return (
          selectedDate instanceof CalendarDate && isSameDay(selectedDate, date)
        );
      case "multiselect":
        return (
          Array.isArray(selectedDate) &&
          !!selectedDate.find((element) => isSameDay(element, date))
        );
      default:
        return false;
    }
  };

  const [hoveredDate, setHoveredDateState] = useControlled({
    controlled: hoveredDateProp,
    default: undefined,
    name: "Calendar",
    state: "hoveredDate",
  });

  const setHoveredDate = (event: SyntheticEvent, date: DateValue | null) => {
    setHoveredDateState(date);
    onHoveredDateChange?.(event, date);
  };

  const isHovered = (date: DateValue) => {
    return !!hoveredDate && isSameDay(date, hoveredDate);
  };

  const isSelectedSpan = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection(selectedDate) &&
      selectedDate?.startDate &&
      selectedDate?.endDate
    ) {
      return (
        date.compare(selectedDate.startDate) > 0 &&
        date.compare(selectedDate.endDate) < 0
      );
    }
    return false;
  };
  const isHoveredSpan = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection(selectedDate) &&
      selectedDate.startDate &&
      !selectedDate.endDate &&
      hoveredDate
    ) {
      const isForwardRange =
        hoveredDate.compare(selectedDate.startDate) > 0 &&
        ((date.compare(selectedDate.startDate) > 0 &&
          date.compare(hoveredDate) < 0) ||
          isSameDay(date, hoveredDate));

      const isValidDayHovered =
        !isDaySelectable || isDaySelectable(hoveredDate);

      return isForwardRange && isValidDayHovered;
    }
    return false;
  };

  const isSelectedStart = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection(selectedDate) &&
      selectedDate.startDate
    ) {
      return isSameDay(selectedDate.startDate, date);
    }
    return false;
  };

  const isSelectedEnd = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection(selectedDate) &&
      selectedDate.endDate
    ) {
      return isSameDay(selectedDate.endDate, date);
    }
    return false;
  };

  const isHoveredOffset = (date: DateValue) => {
    if (hoveredDate && selectionVariant === "offset") {
      const startDate = getStartDateOffset(hoveredDate);
      const endDate = getEndDateOffset(hoveredDate);

      return (
        date.compare(startDate) >= 0 &&
        date.compare(endDate) <= 0 &&
        (!isDaySelectable || isDaySelectable(date))
      );
    }

    return false;
  };

  return {
    state: {
      selectedDate,
      hoveredDate,
    },
    helpers: {
      setSelectedDate,
      isSelected,
      setHoveredDate,
      isHovered,
      isSelectedSpan,
      isHoveredSpan,
      isSelectedStart,
      isSelectedEnd,
      isHoveredOffset,
      isDaySelectable,
    },
  };
}

export function useCalendarSelectionDay({ date }: { date: DateValue }) {
  const {
    helpers: {
      setSelectedDate,
      isSelected,
      setHoveredDate,
      isSelectedSpan,
      isHoveredSpan,
      isSelectedStart,
      isSelectedEnd,
      isHovered,
      isHoveredOffset,
      isDaySelectable,
    },
  } = useCalendarContext();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setSelectedDate(event, date);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    switch (event.key) {
      case "Space":
      case "Enter":
        setSelectedDate(event, date);
        event.preventDefault();
    }
  };

  const handleMouseOver: MouseEventHandler<HTMLButtonElement> = (event) => {
    setHoveredDate(event, date);
  };

  const handleMouseLeave: MouseEventHandler<HTMLButtonElement> = (event) => {
    setHoveredDate(event, null);
  };

  const selected = isSelected(date);
  const selectedSpan = isSelectedSpan(date);
  const hoveredSpan = isHoveredSpan(date);
  const selectedStart = isSelectedStart(date);
  const selectedEnd = isSelectedEnd(date);
  const hovered = isHovered(date);
  const hoveredOffset = isHoveredOffset(date);

  return {
    handleClick,
    handleKeyDown,
    handleMouseOver,
    handleMouseLeave,
    status: {
      selected,
      selectedSpan,
      hoveredSpan,
      selectedStart,
      selectedEnd,
      hovered,
      hoveredOffset,
    },
    dayProps: {
      className: clsx({
        [withBaseName("selected")]: selected,
        [withBaseName("selectedSpan")]: selectedSpan,
        [withBaseName("hoveredSpan")]: hoveredSpan,
        [withBaseName("selectedStart")]: selectedStart,
        [withBaseName("selectedEnd")]: selectedEnd,
        [withBaseName("hovered")]: hovered,
        [withBaseName("hoveredOffset")]: hoveredOffset,
      }),
      "aria-pressed":
        selected || selectedEnd || selectedStart || selectedSpan
          ? "true"
          : undefined,
      "aria-disabled":
        isDaySelectable && !isDaySelectable(date) ? "true" : undefined,
    },
  };
}
