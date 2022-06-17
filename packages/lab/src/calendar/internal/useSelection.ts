import { makePrefixer, useControlled } from "@jpmorganchase/uitk-core";
import classnames from "classnames";
import { KeyboardEventHandler, MouseEventHandler, SyntheticEvent } from "react";
import { isPlainObject } from "../../utils";
import { useCalendarContext } from "./CalendarContext";
import dayjs from "./dayjs";

interface BaseUseSelectionCalendarProps<SelectionVariantType> {
  hoveredDate?: Date | null;
  selectedDate?: SelectionVariantType | null;
  initialSelectedDate?: SelectionVariantType;
  onSelectedDateChange?: (
    event: SyntheticEvent,
    selectedDate: SelectionVariantType
  ) => void;
  isDaySelectable: (date?: Date) => boolean;
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: Date | null
  ) => void;
}

type SingleSelectionValueType = Date;
type MultiSelectionValueType = Date[];
type RangeSelectionValueType = {
  startDate?: Date;
  endDate?: Date;
};
type OffsetSelectionValueType = {
  startDate?: Date;
  endDate?: Date;
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
  startDateOffset?: (date: Date) => Date;
  endDateOffset?: (date: Date) => Date;
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
  item: Date
) {
  if (Array.isArray(array)) {
    if (array.find((element) => dayjs(element).isSame(item, "day"))) {
      return array.filter((element) => !dayjs(element).isSame(item, "day"));
    }
    return array.concat(item);
  }
  return [item];
}

const defaultOffset = (date: Date) => date;

function isRangeOrOffsetSelectionValue(
  selectionValue: AllSelectionValueType
): selectionValue is RangeSelectionValueType | OffsetSelectionValueType {
  return selectionValue !== null && isPlainObject(selectionValue);
}

const withBaseName = makePrefixer("uitkCalendarDay");

export function useSelectionCalendar(props: useSelectionCalendarProps) {
  const {
    hoveredDate: hoveredDateProp,
    selectedDate: selectedDateProp,
    initialSelectedDate,
    // onSelectedDateChange,
    onHoveredDateChange,
    isDaySelectable,
    selectionVariant,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const [selectedDate, setSelectedDateState] = useControlled({
    controlled: selectedDateProp,
    default: initialSelectedDate,
    name: "Calendar",
    state: "selectedDate",
  });

  const getStartDateOffset = (date: Date) => {
    if (props.selectionVariant === "offset" && props.startDateOffset) {
      return props.startDateOffset(date);
    } else {
      return defaultOffset(date);
    }
  };

  const getEndDateOffset = (date: Date) => {
    if (props.selectionVariant === "offset" && props.endDateOffset) {
      return props.endDateOffset(date);
    } else {
      return defaultOffset(date);
    }
  };

  const setSelectedDate = (
    event: SyntheticEvent<HTMLButtonElement>,
    newSelectedDate: Date
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
              dayjs(newSelectedDate).isAfter(base.startDate, "day")
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

  const isSelected = (date: Date) => {
    switch (selectionVariant) {
      case "default":
        return (
          selectedDate instanceof Date &&
          dayjs(selectedDate).isSame(date, "day")
        );
      case "multiselect":
        return (
          Array.isArray(selectedDate) &&
          !!selectedDate.find((element) => dayjs(element).isSame(date, "day"))
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

  const setHoveredDate = (event: SyntheticEvent, date: Date | null) => {
    setHoveredDateState(date);
    onHoveredDateChange?.(event, date);
  };

  const isHovered = (date: Date) => {
    return !!hoveredDate && dayjs(date).isSame(hoveredDate, "date");
  };

  const isSelectedSpan = (date: Date) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate?.startDate &&
      selectedDate?.endDate
    ) {
      return dayjs(date).isBetween(
        selectedDate.startDate,
        selectedDate.endDate,
        "days"
      );
    }
    return false;
  };
  const isHoveredSpan = (date: Date) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate.startDate &&
      !selectedDate.endDate &&
      hoveredDate
    ) {
      const isForwardRange =
        dayjs(hoveredDate).isAfter(selectedDate.startDate) &&
        (dayjs(date).isBetween(selectedDate.startDate, hoveredDate, "day") ||
          dayjs(date).isSame(hoveredDate, "day"));

      const isValidDayHovered = isDaySelectable(hoveredDate);

      return isForwardRange && isValidDayHovered;
    }
    return false;
  };

  const isSelectedStart = (date: Date) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate.startDate
    ) {
      return dayjs(selectedDate.startDate).isSame(date, "day");
    }
    return false;
  };

  const isSelectedEnd = (date: Date) => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isRangeOrOffsetSelectionValue(selectedDate) &&
      selectedDate.endDate
    ) {
      return dayjs(selectedDate.endDate).isSame(date, "day");
    }
    return false;
  };

  const isHoveredOffset = (date: Date) => {
    if (hoveredDate && selectionVariant === "offset") {
      const startDate = getStartDateOffset(hoveredDate);
      const endDate = getEndDateOffset(hoveredDate);

      return (
        dayjs(date).isBetween(dayjs(startDate), dayjs(endDate), "days", "[]") &&
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

export function useSelectionDay({ date }: { date: Date }) {
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
      className: classnames({
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
