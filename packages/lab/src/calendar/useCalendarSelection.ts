import {
  CalendarDate,
  CalendarDateTime,
  type DateValue,
  ZonedDateTime,
  isSameDay,
} from "@internationalized/date";
import { makePrefixer, useControlled } from "@salt-ds/core";
import { clsx } from "clsx";
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { useCallback, useMemo } from "react";
import { useCalendarContext } from "./internal/CalendarContext";

/**
 * Type representing a single date selection.
 */
export type SingleDateSelection<T = DateValue> = T;

/**
 * Type representing multiple date selections.
 */
export type MultipleDateSelection<T = DateValue> = T[];

/**
 * Type representing a date range selection.
 */
export type DateRangeSelection<T =DateValue> = {
  /**
   * The start date of the range.
   */
  startDate?: T | null;
  /**
   * The end date of the range.
   */
  endDate?: T | null;
};

/**
 * Type representing all possible selection value types.
 */
export type AllSelectionValueType<T = DateValue> =
  | SingleDateSelection<T>
  | MultipleDateSelection<T>
  | DateRangeSelection<T>
  | null;

/**
 * The default minimum year used by the calendar.
 */
export const CALENDAR_MIN_YEAR = 1900;

/**
 * The default maximum year used by the calendar.
 */
export const CALENDAR_MAX_YEAR = 2100;

/**
 * Checks if a value is a single date selection.
 * @param value - The value to check.
 * @returns `true` if the value is a single date selection, otherwise `false`.
 */
// biome-ignore lint/suspicious/noExplicitAny: type guard
export function isSingleSelectionValueType(value: any): value is DateValue {
  return (
    value instanceof CalendarDate ||
    value instanceof CalendarDateTime ||
    value instanceof ZonedDateTime
  );
}

/**
 * Checks if a value is a date range selection.
 * @param value - The value to check.
 * @returns `true` if the value is a date range selection, otherwise `false`.
 */
// biome-ignore lint/suspicious/noExplicitAny: type guard
export function isDateRangeSelection(value: any): value is DateRangeSelection {
  return (
    value &&
    typeof value === "object" &&
    ("startDate" in value || "endDate" in value)
  );
}

/**
 * Checks if a value is a multiple date selection.
 * @param value - The value to check.
 * @returns `true` if the value is a multiple date selection, otherwise `false`.
 */
export function isMultipleDateSelection(
  // biome-ignore lint/suspicious/noExplicitAny: type guard
  value: any,
): value is MultipleDateSelection {
  return (
    Array.isArray(value) &&
    value.every((item) => isSingleSelectionValueType(item))
  );
}

/**
 * Base properties for calendar UseCalendarSelection hook.
 * @template SelectionVariantType - The type of the selection variant.
 */
interface UseCalendarSelectionBaseProps<SelectionVariantType> {
  /**
   * The currently hovered date.
   */
  hoveredDate?: DateValue | null;
  /**
   * The currently selected date.
   */
  selectedDate?: SelectionVariantType | null;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: SelectionVariantType;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: SelectionVariantType | null,
  ) => void;
  /**
   * Function to determine if a day is selectable.
   * @param date - The date to check.
   * @returns `true` if the day is selectable, otherwise `false`.
   */
  isDaySelectable?: (date: DateValue) => boolean;
  /**
   * Callback fired when the hovered date changes.
   * @param event - The synthetic event.
   * @param hoveredDate - The new hovered date.
   */
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: DateValue | null,
  ) => void;
}

/**
 * UseCalendar hook props to return a calendar day's status
 */
export interface UseCalendarSelectionOffsetProps
  extends Omit<
    UseCalendarSelectionBaseProps<DateRangeSelection>,
    "startDateOffset" | "endDateOffset"
  > {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
  /**
   * Function to calculate the start date offset.
   * @param date - The date to offset.
   * @returns The offset start date.
   */
  startDateOffset?: (date: DateValue) => DateValue;
  /**
   * Function to calculate the end date offset.
   * @param date - The date to offset.
   * @returns The offset end date.
   */
  endDateOffset?: (date: DateValue) => DateValue;
}

/**
 * Properties for the range date selection hook.
 */
export interface UseCalendarSelectionRangeProps
  extends UseCalendarSelectionBaseProps<DateRangeSelection> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
}

/**
 * Properties for the multi-select date selection hook.
 */
export interface UseCalendarSelectionMultiSelectProps
  extends UseCalendarSelectionBaseProps<MultipleDateSelection> {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
}

/**
 * Properties for the single date selection hook.
 */
export interface UseCalendarSelectionSingleProps
  extends UseCalendarSelectionBaseProps<SingleDateSelection> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
}

/**
 * UseCalendarSelection hook props, wth the selection variant determining the return type of the date selection
 */
export type UseCalendarSelectionProps =
  | UseCalendarSelectionSingleProps
  | UseCalendarSelectionMultiSelectProps
  | UseCalendarSelectionRangeProps
  | UseCalendarSelectionOffsetProps;

const withBaseName = makePrefixer("saltCalendarDay");

function addOrRemoveFromArray(array: AllSelectionValueType, item: DateValue) {
  if (Array.isArray(array)) {
    if (array.find((element) => isSameDay(element, item))) {
      return array.filter((element) => !isSameDay(element, item));
    }
    return array.concat(item);
  }
  return [item];
}

const updateRangeSelection = (
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

export function useCalendarSelection(props: UseCalendarSelectionProps) {
  const {
    hoveredDate: hoveredDateProp,
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    onSelectionChange,
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

  const startDateOffset =
    selectionVariant === "offset" ? props.startDateOffset : undefined;
  const endDateOffset =
    selectionVariant === "offset" ? props.endDateOffset : undefined;

  const getStartDateOffset = useCallback(
    (date: DateValue) => {
      if (selectionVariant === "offset" && startDateOffset) {
        return startDateOffset(date);
      }
      return date;
    },
    [selectionVariant, startDateOffset],
  );

  const getEndDateOffset = useCallback(
    (date: DateValue) => {
      if (selectionVariant === "offset" && endDateOffset) {
        return endDateOffset(date);
      }
      return date;
    },
    [selectionVariant, endDateOffset],
  );

  const setSelectedDate = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>, newSelectedDate: DateValue) => {
      if (!isDaySelectable || isDaySelectable(newSelectedDate)) {
        switch (selectionVariant) {
          case "single": {
            setSelectedDateState(newSelectedDate);
            onSelectionChange?.(event, newSelectedDate);
            break;
          }
          case "multiselect": {
            const newMultiSelectDate = addOrRemoveFromArray(
              selectedDate as DateValue[],
              newSelectedDate,
            );
            setSelectedDateState(newMultiSelectDate);
            onSelectionChange?.(event, newMultiSelectDate);
            break;
          }
          case "range": {
            const newRangeDate = updateRangeSelection(
              selectedDate as DateRangeSelection,
              newSelectedDate,
            );
            setSelectedDateState(newRangeDate);
            onSelectionChange?.(event, newRangeDate);
            break;
          }
          case "offset": {
            const newOffsetDate: DateRangeSelection = {
              startDate: getStartDateOffset(newSelectedDate),
              endDate: getEndDateOffset(newSelectedDate),
            };
            setSelectedDateState(newOffsetDate);
            props.onSelectionChange?.(event, newOffsetDate);
            break;
          }
        }
      }
    },
    [isDaySelectable, selectedDate, selectionVariant, onSelectionChange],
  );

  const isSelected = useCallback(
    (date: DateValue) => {
      switch (selectionVariant) {
        case "single":
          return (
            isSingleSelectionValueType(selectedDate) &&
            isSameDay(selectedDate, date)
          );
        case "multiselect":
          return (
            Array.isArray(selectedDate) &&
            !!selectedDate.find((element) => isSameDay(element, date))
          );
        default:
          return false;
      }
    },
    [selectionVariant, selectedDate],
  );

  const [hoveredDate, setHoveredDateState] = useControlled({
    controlled: hoveredDateProp,
    default: undefined,
    name: "Calendar",
    state: "hoveredDate",
  });

  const setHoveredDate = useCallback(
    (event: SyntheticEvent, date: DateValue | null) => {
      setHoveredDateState(date);
      onHoveredDateChange?.(event, date);
    },
    [onHoveredDateChange],
  );

  const isHovered = useCallback(
    (date: DateValue) => {
      return !!hoveredDate && isSameDay(date, hoveredDate);
    },
    [hoveredDate],
  );

  const isSelectedSpan = useCallback(
    (date: DateValue) => {
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
    },
    [selectionVariant, selectedDate],
  );
  const isHoveredSpan = useCallback(
    (date: DateValue) => {
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
    },
    [selectionVariant, selectedDate, hoveredDate, isDaySelectable],
  );

  const isSelectedStart = useCallback(
    (date: DateValue) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        selectedDate.startDate
      ) {
        return isSameDay(selectedDate.startDate, date);
      }
      return false;
    },
    [selectionVariant, selectedDate],
  );

  const isSelectedEnd = useCallback(
    (date: DateValue) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        selectedDate.endDate
      ) {
        return isSameDay(selectedDate.endDate, date);
      }
      return false;
    },
    [selectionVariant, selectedDate],
  );

  const isHoveredOffset = useCallback(
    (date: DateValue) => {
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
    },
    [
      getStartDateOffset,
      getEndDateOffset,
      hoveredDate,
      isDaySelectable,
      selectionVariant,
    ],
  );

  return useMemo(
    () => ({
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
    }),
    [
      selectedDate,
      hoveredDate,
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
    ],
  );
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

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      setSelectedDate(event, date);
    },
    [date, setSelectedDate],
  );

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      switch (event.key) {
        case "Space":
        case "Enter":
          setSelectedDate(event, date);
          event.preventDefault();
      }
    },
    [date, setSelectedDate],
  );

  const handleMouseOver: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      setHoveredDate(event, date);
    },
    [date, setHoveredDate],
  );

  const handleMouseLeave: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      setHoveredDate(event, null);
    },
    [setHoveredDate],
  );

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
