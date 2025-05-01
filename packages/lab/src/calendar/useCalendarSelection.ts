import { makePrefixer, useControlled } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
  Timezone,
} from "@salt-ds/date-adapters";
import { clsx } from "clsx";
import type {
  KeyboardEventHandler,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { useCallback, useMemo } from "react";
import { useLocalization } from "../localization-provider";
import { useCalendarContext } from "./internal/CalendarContext";
import { generateDatesForMonth } from "./internal/utils";

/**
 * Type representing a single date selection.
 * @template TDate - The type of the date object.
 */
export type SingleDateSelection<TDate extends DateFrameworkType> = TDate;

/**
 * Type representing multiple date selections.
 * @template TDate - The type of the date object.
 */
export type MultipleDateSelection<TDate extends DateFrameworkType> = TDate[];

/**
 * Type representing a date range selection.
 * @template TDate - The type of the date object.
 */
export type DateRangeSelection<TDate extends DateFrameworkType> = {
  /**
   * The start date of the range.
   */
  startDate?: TDate | null;
  /**
   * The end date of the range.
   */
  endDate?: TDate | null;
};

/**
 * Type representing all possible selection value types.
 * @template TDate - The type of the date object.
 */
export type AllSelectionValueType<TDate extends DateFrameworkType> =
  | SingleDateSelection<TDate>
  | MultipleDateSelection<TDate>
  | DateRangeSelection<TDate>
  | null;

/**
 * Checks if a value is a single date selection.
 * @template TDate - The type of the date object.
 * @param value - The value to check.
 * @returns `true` if the value is a single date selection, otherwise `false`.
 */
export function isSingleSelectionValueType<TDate extends DateFrameworkType>(
  // biome-ignore lint/suspicious/noExplicitAny: date framework dependent
  value: any,
): value is TDate {
  return (
    !isMultipleDateSelection<TDate>(value) &&
    !isDateRangeSelection<TDate>(value)
  );
}

/**
 * Checks if a value is a date range selection.
 * @template TDate - The type of the date object.
 * @param value - The value to check.
 * @returns `true` if the value is a date range selection, otherwise `false`.
 */
export function isDateRangeSelection<TDate extends DateFrameworkType>(
  // biome-ignore lint/suspicious/noExplicitAny: date framework dependent
  value: any,
): value is DateRangeSelection<TDate> {
  return (
    value &&
    typeof value === "object" &&
    ("startDate" in value || "endDate" in value)
  );
}

/**
 * Checks if a value is a multiple date selection.
 * @template TDate - The type of the date object.
 * @param value - The value to check.
 * @returns `true` if the value is a multiple date selection, otherwise `false`.
 */
export function isMultipleDateSelection<TDate extends DateFrameworkType>(
  // biome-ignore lint/suspicious/noExplicitAny: type guard
  value: any,
): value is MultipleDateSelection<TDate> {
  return (
    Array.isArray(value) &&
    value.every((item) => isSingleSelectionValueType(item))
  );
}

/**
 * Base properties for calendar UseCalendarSelection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionBaseProps<
  TDate extends DateFrameworkType,
> {
  /**
   * The currently focused date in the calendar, or null if no date is focused.
   */
  focusedDate?: TDate | null;
  /**
   * The currently hovered date.
   */
  hoveredDate?: TDate | null;
  /**
   * Determines if a date is outside the allowed date range.
   * @param date - The date to check.
   * @returns `true` if the date is outside the allowed range, otherwise `false`.
   */
  isOutsideAllowedDates?: (date: TDate) => boolean;
  /**
   * Function to determine if a day is selectable.
   * @param date - The date to check.
   * @returns `true` if the day is selectable, otherwise `false`.
   */
  isDaySelectable?: (date: TDate) => boolean;
  /**
   * Function to determine if a day is visible.
   * @param date - The date to check.
   * @returns `true` if the day is visible, otherwise `false`.
   */
  isDayVisible?: (date: TDate) => boolean;
  /**
   * Ref to attach to the focused element, enabling focus to be controlled.
   */
  focusedDateRef?: React.MutableRefObject<HTMLElement | null>;
  /**
   * Callback fired when the focused date changes.
   * @param event - The synthetic event, if user event triggered focus or undefined.
   * @param date - The new focused date.
   */
  onFocusedDateChange?: (
    event: SyntheticEvent | undefined,
    date: TDate | null,
  ) => void;
  /**
   * Callback fired when the hovered date changes.
   * @param event - The synthetic event.
   * @param hoveredDate - The new hovered date.
   */
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: TDate | null,
  ) => void;
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
   * The currently visible month.
   */
  visibleMonth?: TDate;
}

/**
 * UseCalendar hook props to return a calendar day's status
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionOffsetProps<
  TDate extends DateFrameworkType,
> extends Omit<
    UseCalendarSelectionBaseProps<TDate>,
    "startDateOffset" | "endDateOffset"
  > {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
  /**
   * The currently selected date.
   */
  selectedDate?: DateRangeSelection<TDate>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: DateRangeSelection<TDate>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: DateRangeSelection<TDate>,
  ) => void;
  /**
   * Function to calculate the start date offset.
   * @param date - The date to offset.
   * @returns The offset start date.
   */
  startDateOffset?: (date: TDate) => TDate;
  /**
   * Function to calculate the end date offset.
   * @param date - The date to offset.
   * @returns The offset end date.
   */
  endDateOffset?: (date: TDate) => TDate;
}

/**
 * Properties for the range date selection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionRangeProps<TDate extends DateFrameworkType>
  extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
  /**
   * The currently selected date.
   */
  selectedDate?: DateRangeSelection<TDate>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: DateRangeSelection<TDate>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: DateRangeSelection<TDate>,
  ) => void;
}

/**
 * Properties for the multi-select date selection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionMultiSelectProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "multiselect".
   */
  selectionVariant: "multiselect";
  /**
   * The currently selected date.
   */
  selectedDate?: MultipleDateSelection<TDate>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: MultipleDateSelection<TDate>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: MultipleDateSelection<TDate>,
  ) => void;
}

/**
 * Properties for the single date selection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionSingleProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
  /**
   * The currently selected date.
   */
  selectedDate?: SingleDateSelection<TDate> | null;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: SingleDateSelection<TDate> | null;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: SingleDateSelection<TDate> | null,
  ) => void;
}

/**
 * UseCalendarSelection hook props, wth the selection variant determining the return type of the date selection
 * @template TDate - The type of the date object.
 */
export type UseCalendarSelectionProps<TDate extends DateFrameworkType> =
  | UseCalendarSelectionSingleProps<TDate>
  | UseCalendarSelectionMultiSelectProps<TDate>
  | UseCalendarSelectionRangeProps<TDate>
  | UseCalendarSelectionOffsetProps<TDate>;

const withBaseName = makePrefixer("saltCalendarDay");

function addOrRemoveFromArray<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  array: AllSelectionValueType<TDate>,
  item: TDate,
) {
  if (Array.isArray(array)) {
    const filteredArray = array.filter(
      (element) => !dateAdapter.isSame(element, item, "day"),
    );
    if (filteredArray.length === array.length) {
      return array.concat(item);
    }
    return filteredArray;
  }
  return [item];
}

function updateRangeSelection<TDate extends DateFrameworkType>(
  datePicker: SaltDateAdapter<TDate>,
  currentSelectedDate: DateRangeSelection<TDate> | undefined,
  newSelectedDate: TDate,
): DateRangeSelection<TDate> {
  let base = { ...currentSelectedDate };
  if (base?.startDate && base?.endDate) {
    base = { startDate: newSelectedDate };
  } else if (
    base?.startDate &&
    datePicker.compare(newSelectedDate, base.startDate) < 0
  ) {
    base = { startDate: newSelectedDate };
  } else if (
    base?.startDate &&
    datePicker.compare(newSelectedDate, base.startDate) >= 0
  ) {
    base = { ...base, endDate: newSelectedDate };
  } else {
    base = { startDate: newSelectedDate };
  }
  return base;
}

export function useCalendarSelection<TDate extends DateFrameworkType>(
  props: UseCalendarSelectionProps<TDate>,
) {
  const {
    focusedDate: focusedDateProp,
    hoveredDate: hoveredDateProp,
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    onSelectionChange,
    onHoveredDateChange,
    isDaySelectable = () => true,
    isDayVisible = () => true,
    isOutsideAllowedDates = () => true,
    focusedDateRef,
    onFocusedDateChange,
    selectionVariant,
    timezone,
    visibleMonth,
    // startDateOffset,
    // endDateOffset,
  } = props;
  const { dateAdapter } = useLocalization<TDate>();
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
    (date: TDate) => {
      if (selectionVariant === "offset" && startDateOffset) {
        return startDateOffset(date);
      }
      return date;
    },
    [selectionVariant, startDateOffset],
  );

  const getEndDateOffset = useCallback(
    (date: TDate) => {
      if (selectionVariant === "offset" && endDateOffset) {
        return endDateOffset(date);
      }
      return date;
    },
    [selectionVariant, endDateOffset],
  );

  const setSelectedDate = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>, newSelectedDate: TDate) => {
      if (!isDaySelectable || isDaySelectable(newSelectedDate)) {
        switch (selectionVariant) {
          case "single": {
            setSelectedDateState(newSelectedDate);
            onSelectionChange?.(event, newSelectedDate);
            break;
          }
          case "multiselect": {
            const newMultiSelectDate = addOrRemoveFromArray<TDate>(
              dateAdapter,
              selectedDate as TDate[],
              newSelectedDate,
            );
            setSelectedDateState(newMultiSelectDate);
            onSelectionChange?.(event, newMultiSelectDate);
            break;
          }
          case "range": {
            const newRangeDate = updateRangeSelection<TDate>(
              dateAdapter,
              selectedDate as DateRangeSelection<TDate>,
              newSelectedDate,
            );
            setSelectedDateState(newRangeDate);
            onSelectionChange?.(event, newRangeDate);
            break;
          }
          case "offset": {
            const newOffsetDate: DateRangeSelection<TDate> = {
              startDate: getStartDateOffset(newSelectedDate),
              endDate: getEndDateOffset(newSelectedDate),
            };
            setSelectedDateState(newOffsetDate);
            onSelectionChange?.(event, newOffsetDate);
            break;
          }
        }
      }
    },
    [
      dateAdapter,
      getEndDateOffset,
      getStartDateOffset,
      isDaySelectable,
      selectedDate,
      selectionVariant,
      onSelectionChange,
    ],
  );

  const isSelected = useCallback(
    (date: TDate) => {
      if (!selectedDate) {
        return false;
      }
      switch (selectionVariant) {
        case "single":
          return (
            isSingleSelectionValueType(selectedDate) &&
            dateAdapter.isSame(selectedDate as TDate, date, "day")
          );
        case "multiselect":
          return (
            Array.isArray(selectedDate) &&
            !!selectedDate.find((element) =>
              dateAdapter.isSame(element, date, "day"),
            )
          );
        default:
          return false;
      }
    },
    [dateAdapter, selectionVariant, selectedDate],
  );

  const getDefaultFocusedDate = () => {
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection<TDate>(selectedDate)
    ) {
      if (selectedDate?.startDate && isDayVisible(selectedDate.startDate)) {
        return selectedDate.startDate;
      }
      if (selectedDate?.endDate && isDayVisible(selectedDate.endDate)) {
        return selectedDate.endDate;
      }
    } else if (
      selectionVariant === "multiselect" &&
      Array.isArray(selectedDate)
    ) {
      // return first selected day in visible month
      const selectionInMonth = selectedDate
        .filter((day) => isDayVisible(day))
        .sort((a, b) => dateAdapter.compare(a, b));
      if (selectionInMonth.length > 0) {
        return selectionInMonth[0];
      }
    } else if (
      selectedDate &&
      selectionVariant === "single" &&
      !isDateRangeSelection(selectedDate) &&
      !Array.isArray(selectedDate) &&
      isDayVisible(selectedDate)
    ) {
      return selectedDate;
    }
    // Defaults
    if (
      isDaySelectable?.(dateAdapter.today(timezone)) &&
      isDayVisible(dateAdapter.today(timezone))
    ) {
      return dateAdapter.today(timezone);
    }
    const firstSelectableDate = generateDatesForMonth(
      dateAdapter,
      visibleMonth,
    ).find((visibleDay) => visibleDay && isDaySelectable?.(visibleDay));
    if (firstSelectableDate) {
      return firstSelectableDate;
    }
    return null;
  };

  const [focusedDate, setFocusedDateState] = useControlled({
    controlled: focusedDateProp,
    default: useMemo(getDefaultFocusedDate, []),
    name: "Calendar",
    state: "focusedDate",
  });

  const setFocusedDate = useCallback(
    (event: SyntheticEvent | undefined, date: TDate | null) => {
      if (focusedDateRef && event?.target instanceof HTMLElement) {
        focusedDateRef.current = event.target;
      }
      if (
        date &&
        ((focusedDate && dateAdapter.isSame(date, focusedDate, "day")) ||
          isOutsideAllowedDates(date))
      ) {
        return;
      }
      setFocusedDateState(date);
      onFocusedDateChange?.(event, date);
    },
    [
      dateAdapter,
      focusedDate,
      focusedDateRef,
      isOutsideAllowedDates,
      onFocusedDateChange,
    ],
  );

  const [hoveredDate, setHoveredDateState] = useControlled({
    controlled: hoveredDateProp,
    default: undefined,
    name: "Calendar",
    state: "hoveredDate",
  });

  const setHoveredDate = useCallback(
    (event: SyntheticEvent, date: TDate | null) => {
      setHoveredDateState(date);
      onHoveredDateChange?.(event, date);
    },
    [onHoveredDateChange],
  );

  const isHovered = useCallback(
    (date: TDate) => {
      return !!hoveredDate && dateAdapter.isSame(date, hoveredDate, "day");
    },
    [dateAdapter, hoveredDate],
  );

  const getFocusableDates = useCallback(() => {
    const focusableDates = [];
    if (
      (selectionVariant === "range" || selectionVariant === "offset") &&
      isDateRangeSelection<TDate>(selectedDate)
    ) {
      if (selectedDate?.startDate && isDayVisible(selectedDate.startDate)) {
        focusableDates.push(selectedDate.startDate);
      } else if (selectedDate?.endDate && isDayVisible(selectedDate.endDate)) {
        focusableDates.push(selectedDate.endDate);
      }
    } else if (
      selectionVariant === "multiselect" &&
      Array.isArray(selectedDate)
    ) {
      // return first selected day in visible month
      const selectionInMonth = selectedDate
        .filter((day) => isDayVisible(day))
        .sort((a, b) => dateAdapter.compare(a, b));
      if (selectionInMonth.length > 0) {
        focusableDates.push(selectionInMonth[0]);
      }
    } else if (
      selectionVariant === "single" &&
      !isDateRangeSelection(selectedDate) &&
      !Array.isArray(selectedDate) &&
      selectedDate &&
      isDayVisible(selectedDate)
    ) {
      focusableDates.push(selectedDate);
    }
    if (
      focusedDate &&
      visibleMonth &&
      dateAdapter.isSame(focusedDate, visibleMonth, "month")
    ) {
      focusableDates.push(focusedDate);
      return focusableDates;
    }
    // Defaults
    if (
      focusableDates.length === 0 &&
      isDaySelectable(dateAdapter.today(timezone)) &&
      isDayVisible(dateAdapter.today(timezone))
    ) {
      focusableDates.push(dateAdapter.today(timezone));
    }
    if (focusableDates.length === 0 || !focusableDates.some(isDayVisible)) {
      const firstSelectableDate = generateDatesForMonth(
        dateAdapter,
        visibleMonth,
      ).find((visibleDay) => visibleDay && isDaySelectable(visibleDay));
      if (firstSelectableDate) {
        focusableDates.push(firstSelectableDate);
      }
    }
    return focusableDates;
  }, [
    dateAdapter,
    focusedDate,
    isDaySelectable,
    isDayVisible,
    selectedDate,
    selectionVariant,
    timezone,
    visibleMonth,
  ]);

  const isSelectedSpan = useCallback(
    (date: TDate) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        dateAdapter.isValid(selectedDate.startDate) &&
        dateAdapter.isValid(selectedDate.endDate) &&
        !isOutsideAllowedDates(selectedDate.startDate) &&
        !isOutsideAllowedDates(selectedDate.endDate)
      ) {
        return (
          dateAdapter.compare(date, selectedDate.startDate) > 0 &&
          dateAdapter.compare(date, selectedDate.endDate) < 0
        );
      }
      return false;
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );
  const isHoveredSpan = useCallback(
    (date: TDate) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        dateAdapter.isValid(selectedDate.startDate) &&
        !dateAdapter.isValid(selectedDate.endDate) &&
        !isOutsideAllowedDates(selectedDate.startDate) &&
        hoveredDate
      ) {
        const isForwardRange =
          dateAdapter.compare(hoveredDate, selectedDate.startDate) > 0 &&
          ((dateAdapter.compare(date, selectedDate.startDate) > 0 &&
            dateAdapter.compare(date, hoveredDate) < 0) ||
            dateAdapter.isSame(date, hoveredDate, "day"));

        const isValidDayHovered =
          !isDaySelectable || isDaySelectable(hoveredDate);

        return isForwardRange && isValidDayHovered;
      }
      return false;
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate, hoveredDate, isDaySelectable],
  );

  const isSelectedStart = useCallback(
    (date: TDate) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        dateAdapter.isValid(selectedDate.startDate) &&
        !isOutsideAllowedDates(selectedDate.startDate)
      ) {
        return dateAdapter.isSame(selectedDate.startDate, date, "day");
      }
      return false;
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );

  const isSelectedEnd = useCallback(
    (date: TDate) => {
      if (
        (selectionVariant === "range" || selectionVariant === "offset") &&
        isDateRangeSelection(selectedDate) &&
        dateAdapter.isValid(selectedDate.endDate) &&
        !isOutsideAllowedDates(selectedDate.endDate)
      ) {
        return dateAdapter.isSame(selectedDate.endDate, date, "day");
      }
      return false;
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );

  const isHoveredOffset = useCallback(
    (date: TDate) => {
      if (hoveredDate && selectionVariant === "offset") {
        const startDate = getStartDateOffset(hoveredDate);
        const endDate = getEndDateOffset(hoveredDate);

        return (
          dateAdapter.compare(date, startDate) >= 0 &&
          dateAdapter.compare(date, endDate) <= 0 &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }

      return false;
    },
    [
      dateAdapter,
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
        focusedDate,
        focusedDateRef,
        hoveredDate,
        selectedDate,
        focusableDates: getFocusableDates(),
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
        setFocusedDate,
      },
    }),
    [
      selectedDate,
      focusedDate,
      focusedDateRef,
      getFocusableDates,
      hoveredDate,
      isSelected,
      isHovered,
      isSelectedSpan,
      isHoveredSpan,
      isSelectedStart,
      isSelectedEnd,
      isHoveredOffset,
      isDaySelectable,
      setFocusedDate,
      setHoveredDate,
      setSelectedDate,
    ],
  );
}

export function useCalendarSelectionDay<TDate extends DateFrameworkType>({
  date,
}: {
  date: TDate;
}) {
  const {
    helpers: {
      setSelectedDate,
      isSelected,
      isSelectedSpan,
      isHoveredSpan,
      isSelectedStart,
      isSelectedEnd,
      isHovered,
      isHoveredOffset,
      isDaySelectable,
    },
  } = useCalendarContext<TDate>();

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
