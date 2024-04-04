import { makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import { KeyboardEventHandler, MouseEventHandler, SyntheticEvent } from "react";
import { isPlainObject } from "../utils";
import { useCalendarContext } from "./internal/CalendarContext";
import { CalendarDate, DateValue, isSameDay } from "@internationalized/date";

interface BaseUseSelectionCalendarProps<SelectionVariantType> {
  hoveredDate?: DateValue | null;
  selectedDate?: SelectionVariantType | null;
  defaultSelectedDate?: SelectionVariantType;
  onSelectedDateChange?: (
    event: SyntheticEvent,
    selectedDate: SelectionVariantType
  ) => void;
  isDaySelectable: (date?: DateValue) => boolean;
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: DateValue | null
  ) => void;
}

type SingleSelectionValueType = DateValue;
type MultiSelectionValueType = DateValue[];
type RangeSelectionValueType = {
  startDate?: DateValue;
  endDate?: DateValue;
};
type OffsetSelectionValueType = {
  startDate?: DateValue;
  endDate?: DateValue;
};

type AllSelectionValueType =
  | SingleSelectionValueType
  | MultiSelectionValueType
  | RangeSelectionValueType
  | OffsetSelectionValueType
  | null;

export interface UseOffsetSelectionCalendarProps
  extends Omit<
    BaseUseSelectionCalendarProps<OffsetSelectionValueType>,
    "startDateOffset" | "endDateOffset"
  > {
  selectionVariant: "offset";
  startDateOffset?: (date: DateValue) => DateValue;
  endDateOffset?: (date: DateValue) => DateValue;
}

export interface UseRangeSelectionCalendarProps
  extends BaseUseSelectionCalendarProps<RangeSelectionValueType> {
  selectionVariant: "range";
}

export interface UseMultiSelectionCalendarProps
  extends BaseUseSelectionCalendarProps<MultiSelectionValueType> {
  selectionVariant: "multiselect";
}

export interface UseSingleSelectionCalendarProps
  extends BaseUseSelectionCalendarProps<SingleSelectionValueType> {
  selectionVariant: "default";
}

export type useSelectionCalendarProps =
  | UseSingleSelectionCalendarProps
  | UseMultiSelectionCalendarProps
  | UseRangeSelectionCalendarProps
  | UseOffsetSelectionCalendarProps;

function addOrRemoveFromArray(
  array: AllSelectionValueType | null = [],
  item: DateValue
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

function isRangeOrOffsetSelectionValue(
  selectionValue?: AllSelectionValueType
): selectionValue is RangeSelectionValueType | OffsetSelectionValueType {
  return selectionValue != null && isPlainObject(selectionValue);
}

const withBaseName = makePrefixer("saltCalendarDay");

export function useSelectionCalendar(props: useSelectionCalendarProps) {
  const {
    hoveredDate: hoveredDateProp,
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    // onSelectedDateChange,
    onHoveredDateChange,
    isDaySelectable,
    selectionVariant,
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
    newSelectedDate: DateValue
  ) => {
    if (isDaySelectable(newSelectedDate)) {
      switch (props.selectionVariant) {
        case "default":
          setSelectedDateState(newSelectedDate);
          props.onSelectedDateChange?.(event, newSelectedDate);
          break;
        case "multiselect":
          const newDates = addOrRemoveFromArray(selectedDate, newSelectedDate);
          setSelectedDateState(newDates);
          props.onSelectedDateChange?.(event, newDates);
          break;
        case "range":
          let base = selectedDate;
          if (isRangeOrOffsetSelectionValue(base)) {
            if (base?.startDate && base?.endDate) {
              base = { startDate: newSelectedDate };
            } else if (
              base?.startDate &&
              newSelectedDate.compare(base.startDate) > 0
            ) {
              base = { ...base, endDate: newSelectedDate };
            } else {
              base = { startDate: newSelectedDate };
            }
          } else {
            base = { startDate: newSelectedDate };
          }
          setSelectedDateState(base);
          props.onSelectedDateChange?.(event, base);
          break;
        case "offset":
          const newRange = {
            startDate: getStartDateOffset(newSelectedDate),
            endDate: getEndDateOffset(newSelectedDate),
          };
          setSelectedDateState(newRange);
          props.onSelectedDateChange?.(event, newRange);
      }
    }
  };

  const isSelected = (date: DateValue) => {
    switch (selectionVariant) {
      case "default":
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
      isRangeOrOffsetSelectionValue(selectedDate) &&
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
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate.startDate &&
      !selectedDate.endDate &&
      hoveredDate
    ) {
      const isForwardRange =
        hoveredDate.compare(selectedDate.startDate) > 0 &&
        ((date.compare(selectedDate.startDate) > 0 &&
          date.compare(hoveredDate) < 0) ||
          isSameDay(date, hoveredDate));

      const isValidDayHovered = isDaySelectable(hoveredDate);

      return isForwardRange && isValidDayHovered;
    }
    return false;
  };

  const isSelectedStart = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate.startDate
    ) {
      return isSameDay(selectedDate.startDate, date);
    }
    return false;
  };

  const isSelectedEnd = (date: DateValue) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
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
        isDaySelectable(date)
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
    },
  };
}

export function useSelectionDay({ date }: { date: DateValue }) {
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
      isDayUnselectable,
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
      "aria-disabled": !!isDayUnselectable(date) ? "true" : undefined,
    },
  };
}
