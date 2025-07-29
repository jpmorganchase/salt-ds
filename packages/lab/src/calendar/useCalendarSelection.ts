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
    !Array.isArray(value) &&
    typeof value === "object" &&
    ("startDate" in value || "endDate" in value)
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
   * @param event - The synthetic event, if user event triggered focus or null.
   * @param date - The new focused date.
   */
  onFocusedDateChange?: (
    event: SyntheticEvent | null,
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
  /**
   * If `true`, the calendar will be multiselect.
   */
  multiselect?: boolean;
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
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   * @param newDate
   */
  select?: (
    previousSelectedDate: SingleDateSelection<TDate> | null,
    newDate: SingleDateSelection<TDate> | null,
  ) => SingleDateSelection<TDate> | null;
}
/**
 * Properties for the single date selection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionMultiselectSingleProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: "single";
  /**
   * Multiple selection
   */
  multiselect: true;
  /**
   * The currently selected date.
   */
  selectedDate?: Array<SingleDateSelection<TDate>>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: Array<SingleDateSelection<TDate>>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: Array<SingleDateSelection<TDate>>,
  ) => void;
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   @param newDate
   */
  select?: (
    previousSelectedDate: Array<SingleDateSelection<TDate>>,
    newDate: TDate,
  ) => Array<SingleDateSelection<TDate>>;
}

/**
 * UseCalendar hook props to return a calendar day's status for single date range selection.
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
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   * @param newDate
   */
  select?: (
    previousSelectedDate: DateRangeSelection<TDate>,
    newDate: TDate,
  ) => DateRangeSelection<TDate>;
}

/**
 * UseCalendar hook props to return a calendar day's status for multiselect date range selection.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionMultiselectRangeProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "range".
   */
  selectionVariant: "range";
  /**
   * Multiple selection
   */
  multiselect: true;
  /**
   * The currently selected date.
   */
  selectedDate?: Array<DateRangeSelection<TDate>>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: Array<DateRangeSelection<TDate>>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: Array<DateRangeSelection<TDate>>,
  ) => void;
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   * @param newDate
   */
  select?: (
    previousSelectedDate: Array<DateRangeSelection<TDate>>,
    newDate: TDate,
  ) => Array<DateRangeSelection<TDate>>;
}

/**
 * UseCalendar hook props to return a calendar day's status for single offset selection.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionOffsetProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
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
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   * @param newDate
   */
  select?: (
    previousSelectedDate: DateRangeSelection<TDate>,
    newDate: TDate,
  ) => DateRangeSelection<TDate>;
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
 * UseCalendar hook props to return a calendar day's status for multiselect offset selection.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionMultiselectOffsetProps<
  TDate extends DateFrameworkType,
> extends UseCalendarSelectionBaseProps<TDate> {
  /**
   * The selection variant, set to "offset".
   */
  selectionVariant: "offset";
  /**
   * Multiple selection
   */
  multiselect: true;
  /**
   * The currently selected date.
   */
  selectedDate?: Array<DateRangeSelection<TDate>>;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: Array<DateRangeSelection<TDate>>;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate: Array<DateRangeSelection<TDate>>,
  ) => void;
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDat
   * @param newDate
   */
  select?: (
    previousSelectedDate: Array<DateRangeSelection<TDate>>,
    newDate: TDate,
  ) => Array<DateRangeSelection<TDate>>;
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
 * UseCalendarSelection hook props, wth the selection variant determining the return type of the date selection
 * @template TDate - The type of the date object.
 */
export type UseCalendarSelectionProps<TDate extends DateFrameworkType> =
  | UseCalendarSelectionSingleProps<TDate>
  | UseCalendarSelectionMultiselectSingleProps<TDate>
  | UseCalendarSelectionRangeProps<TDate>
  | UseCalendarSelectionMultiselectRangeProps<TDate>
  | UseCalendarSelectionOffsetProps<TDate>
  | UseCalendarSelectionMultiselectOffsetProps<TDate>;

function isMultiselect<TDate>(
  props: UseCalendarSelectionProps<TDate>,
): props is
  | UseCalendarSelectionMultiselectSingleProps<TDate>
  | UseCalendarSelectionMultiselectRangeProps<TDate>
  | UseCalendarSelectionMultiselectOffsetProps<TDate> {
  return props.multiselect === true;
}

const withBaseName = makePrefixer("saltCalendarDay");

function selectDateRange<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  previousSelectedDate: DateRangeSelection<DateFrameworkType>,
  newDate: DateFrameworkType,
) {
  if (previousSelectedDate?.startDate && previousSelectedDate?.endDate) {
    return {
      startDate: newDate,
    };
  }
  if (
    previousSelectedDate?.startDate &&
    dateAdapter.compare(newDate, previousSelectedDate?.startDate) >= 0
  ) {
    return {
      ...previousSelectedDate,
      endDate: newDate,
    };
  }
  return {
    startDate: newDate,
  };
}

function selectMultiselectDateRange<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  previousSelectedDate: DateRangeSelection<TDate>[],
  newDate: TDate,
): DateRangeSelection<TDate>[] {
  const lastRange = previousSelectedDate.length
    ? previousSelectedDate[previousSelectedDate.length - 1]
    : undefined;
  const isIncompleteRange = !lastRange?.endDate;

  if (isIncompleteRange) {
    const isNewSelection = previousSelectedDate.length === 0;
    if (isNewSelection) {
      return [{ startDate: newDate }];
    }
    const completeDateRange = selectDateRange(
      dateAdapter,
      previousSelectedDate[previousSelectedDate.length - 1],
      newDate,
    );
    return [...previousSelectedDate.slice(0, -1), completeDateRange];
  }
  return [...previousSelectedDate, { startDate: newDate }];
}

export function useCalendarSelection<TDate extends DateFrameworkType>(
  props: UseCalendarSelectionProps<TDate>,
) {
  const {
    multiselect,
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
    select: selectProp,
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
        const handleSelectionChange = <
          U extends
            | (TDate | null)
            | TDate[]
            | (DateRangeSelection<TDate> | null)
            | DateRangeSelection<TDate>[],
        >(
          updatedSelection: U,
          changeHandler:
            | ((event: SyntheticEvent, updatedSelection: U) => void)
            | undefined,
        ) => {
          changeHandler?.(event, updatedSelection);
          setSelectedDateState(updatedSelection);
        };

        switch (selectionVariant) {
          case "single": {
            if (isMultiselect(props)) {
              const multipleSingleSelectedDate = selectedDate as Array<
                SingleDateSelection<TDate>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectSingleProps<TDate>["select"];
              const updatedSelection: Array<SingleDateSelection<TDate>> = select
                ? select(multipleSingleSelectedDate ?? [], newSelectedDate)
                : [...(multipleSingleSelectedDate ?? []), newSelectedDate];

              const changeHandler =
                onSelectionChange as UseCalendarSelectionMultiselectSingleProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const singleSelectedDate =
                selectedDate as SingleDateSelection<TDate> | null;
              const select =
                selectProp as UseCalendarSelectionSingleProps<TDate>["select"];
              const updatedSelection: SingleDateSelection<TDate> | null = select
                ? select(singleSelectedDate, newSelectedDate)
                : newSelectedDate;

              const changeHandler =
                onSelectionChange as UseCalendarSelectionSingleProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            }
            break;
          }
          case "range": {
            if (isMultiselect(props)) {
              const multipleRangeSelectedDate = selectedDate as Array<
                DateRangeSelection<TDate>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectRangeProps<TDate>["select"];
              const updatedSelection: DateRangeSelection<TDate>[] = select
                ? select(multipleRangeSelectedDate ?? [], newSelectedDate)
                : selectMultiselectDateRange(
                    dateAdapter,
                    multipleRangeSelectedDate ?? [],
                    newSelectedDate,
                  );

              const changeHandler =
                onSelectionChange as UseCalendarSelectionMultiselectRangeProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const rangeSelectedDate =
                selectedDate as DateRangeSelection<TDate>;
              const select =
                selectProp as UseCalendarSelectionRangeProps<TDate>["select"];
              const updatedSelection: DateRangeSelection<TDate> = select
                ? select(rangeSelectedDate, newSelectedDate)
                : selectDateRange(
                    dateAdapter,
                    rangeSelectedDate,
                    newSelectedDate,
                  );

              const changeHandler =
                onSelectionChange as UseCalendarSelectionRangeProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            }
            break;
          }
          case "offset": {
            if (isMultiselect(props)) {
              const multipleOffsetSelectedDate = selectedDate as Array<
                DateRangeSelection<TDate>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectOffsetProps<TDate>["select"];
              const updatedSelection: DateRangeSelection<TDate>[] = select
                ? select(multipleOffsetSelectedDate ?? [], newSelectedDate)
                : [
                    ...(multipleOffsetSelectedDate ?? []),
                    {
                      startDate: getStartDateOffset(newSelectedDate),
                      endDate: getEndDateOffset(newSelectedDate),
                    },
                  ];

              const changeHandler =
                onSelectionChange as UseCalendarSelectionMultiselectOffsetProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const offsetSelectedDate =
                selectedDate as DateRangeSelection<TDate>;
              const select =
                selectProp as UseCalendarSelectionOffsetProps<TDate>["select"];
              const updatedSelection: DateRangeSelection<TDate> = select
                ? select(offsetSelectedDate, newSelectedDate)
                : {
                    startDate: getStartDateOffset(newSelectedDate),
                    endDate: getEndDateOffset(newSelectedDate),
                  };

              const changeHandler =
                onSelectionChange as UseCalendarSelectionOffsetProps<TDate>["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            }
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
      selectProp,
      selectedDate,
      selectionVariant,
      onSelectionChange,
      props, // Ensure props is included in the dependency array
    ],
  );

  const isSelected = useCallback(
    (date: TDate) => {
      if (!selectedDate) {
        return false;
      }
      if (selectionVariant === "single") {
        const singleDates = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as TDate[];
        return singleDates.some((singleDate) =>
          dateAdapter.isSame(singleDate, date, "day"),
        );
      }
      return false;
    },
    [dateAdapter, selectedDate, selectionVariant],
  );

  const getDefaultFocusedDate = () => {
    if (
      selectedDate &&
      (selectionVariant === "range" || selectionVariant === "offset")
    ) {
      const getFocusableDate = (
        result: TDate[],
        selection: DateRangeSelection<TDate>,
      ) => {
        if (selection?.startDate && isDayVisible(selection.startDate)) {
          return [...result, selection.startDate];
        }
        if (selection?.endDate && isDayVisible(selection.endDate)) {
          return [...result, selection.endDate];
        }
        return result;
      };
      let focusableSelectedDates:
        | DateRangeSelection<TDate>
        | DateRangeSelection<TDate>[];
      if (!multiselect) {
        focusableSelectedDates = [selectedDate as DateRangeSelection<TDate>];
      } else {
        focusableSelectedDates = selectedDate as DateRangeSelection<TDate>[];
      }
      const selectionInMonth = focusableSelectedDates
        .reduce(getFocusableDate, [])
        .sort((a, b) => dateAdapter.compare(a, b));
      if (selectionInMonth.length > 0) {
        return selectionInMonth[0];
      }
    } else if (selectedDate && selectionVariant === "single") {
      const focusableSelectedDate = multiselect
        ? (selectedDate as SingleDateSelection<TDate>[])?.[0]
        : (selectedDate as SingleDateSelection<TDate>);
      if (focusableSelectedDate && isDayVisible(focusableSelectedDate)) {
        return focusableSelectedDate;
      }
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
    (event: SyntheticEvent | null, date: TDate | null) => {
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
    const focusableDates: TDate[] = [];

    if (Array.isArray(selectedDate)) {
      // Handle array of selections
      for (const selection of selectedDate) {
        if (isDateRangeSelection(selection)) {
          if (selection.startDate && isDayVisible(selection.startDate)) {
            focusableDates.push(selection.startDate);
          } else if (selection.endDate && isDayVisible(selection.endDate)) {
            focusableDates.push(selection.endDate);
          }
        } else if (isDayVisible(selection as TDate)) {
          focusableDates.push(selection as TDate);
        }
      }
    } else if (selectedDate) {
      // Handle single selection
      if (isDateRangeSelection(selectedDate)) {
        if (selectedDate.startDate && isDayVisible(selectedDate.startDate)) {
          focusableDates.push(selectedDate.startDate);
        } else if (selectedDate.endDate && isDayVisible(selectedDate.endDate)) {
          focusableDates.push(selectedDate.endDate);
        }
      } else if (isDayVisible(selectedDate)) {
        focusableDates.push(selectedDate);
      }
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
    timezone,
    visibleMonth,
  ]);

  const isHoveredStart = useCallback(
    (date: TDate) => {
      if (
        selectionVariant === "range" &&
        hoveredDate &&
        dateAdapter.isSame(date, hoveredDate, "day")
      ) {
        const dateRanges = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as DateRangeSelection<TDate>[];
        const allDatesPopulated = dateRanges.every(
          (range) => range?.startDate && range?.endDate,
        );
        const startDateMatches = dateRanges.some(
          (range) =>
            range?.startDate &&
            dateAdapter.isSame(date, range.startDate, "day"),
        );
        const firstIncompleteRange = dateRanges.find(
          (range) => range?.startDate && !range?.endDate,
        );
        const newDateRangeRequired =
          firstIncompleteRange?.startDate &&
          dateAdapter.compare(date, firstIncompleteRange.startDate) < 0;
        return allDatesPopulated || startDateMatches || newDateRangeRequired;
      }
      if (selectionVariant === "offset" && hoveredDate) {
        const startDate = getStartDateOffset(hoveredDate);
        return (
          dateAdapter.isSame(date, startDate, "day") &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }
      return false;
    },
    [
      dateAdapter,
      getStartDateOffset,
      selectionVariant,
      selectedDate,
      hoveredDate,
      isDaySelectable,
    ],
  );

  const isHoveredSpan = useCallback(
    (date: TDate) => {
      if (selectionVariant === "range") {
        const dateRanges = Array.isArray(selectedDate)
          ? selectedDate
          : [selectedDate];
        return dateRanges.some((range) => {
          if (
            isDateRangeSelection(range) &&
            dateAdapter.isValid(range.startDate) &&
            !dateAdapter.isValid(range.endDate) &&
            !isOutsideAllowedDates(range.startDate) &&
            hoveredDate
          ) {
            const isForwardRange =
              dateAdapter.compare(hoveredDate, range.startDate) > 0 &&
              dateAdapter.compare(date, range.startDate) > 0 &&
              dateAdapter.compare(date, hoveredDate) < 0;

            const isValidDayHovered =
              !isDaySelectable || isDaySelectable(hoveredDate);

            return isForwardRange && isValidDayHovered;
          }
          return false;
        });
      }
      if (selectionVariant === "offset" && hoveredDate) {
        const startDate = getStartDateOffset(hoveredDate);
        const endDate = getEndDateOffset(hoveredDate);
        return (
          dateAdapter.compare(date, startDate) > 0 &&
          dateAdapter.compare(date, endDate) < 0 &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }
      return false;
    },
    [
      dateAdapter,
      isOutsideAllowedDates,
      selectionVariant,
      selectedDate,
      hoveredDate,
      isDaySelectable,
    ],
  );

  const isHoveredEnd = useCallback(
    (date: TDate) => {
      if (
        selectionVariant === "range" &&
        hoveredDate &&
        dateAdapter.isSame(date, hoveredDate, "day")
      ) {
        const dateRanges = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as DateRangeSelection<TDate>[];
        const isIncompleteRange = dateRanges.some(
          (range) =>
            range?.startDate &&
            !range?.endDate &&
            hoveredDate &&
            dateAdapter.compare(hoveredDate, range.startDate) >= 0,
        );
        const endDateMatches = dateRanges.some(
          (range) =>
            range?.endDate && dateAdapter.isSame(range.endDate, date, "day"),
        );
        return endDateMatches || isIncompleteRange;
      }
      if (selectionVariant === "offset" && hoveredDate) {
        const endDate = getEndDateOffset(hoveredDate);
        return (
          dateAdapter.isSame(date, endDate, "day") &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }
      return false;
    },
    [
      dateAdapter,
      getEndDateOffset,
      selectionVariant,
      selectedDate,
      hoveredDate,
      isDaySelectable,
    ],
  );

  const isSameDay = useCallback(
    (date: TDate) => {
      const dateRanges = Array.isArray(selectedDate)
        ? selectedDate
        : [selectedDate];
      return dateRanges.some((range) => {
        if (
          (selectionVariant === "range" || selectionVariant === "offset") &&
          isDateRangeSelection(range) &&
          range?.startDate &&
          range?.endDate &&
          dateAdapter.isSame(range?.startDate, date, "day")
        ) {
          return dateAdapter.isSame(range?.startDate, range?.endDate, "day");
        }
        return false;
      });
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );

  const isSelectedStart = useCallback(
    (date: TDate) => {
      if (selectionVariant === "single") {
        return false;
      }
      const dateRanges = Array.isArray(selectedDate)
        ? selectedDate
        : [selectedDate];
      return dateRanges.some((range) => {
        if (
          (selectionVariant === "range" || selectionVariant === "offset") &&
          isDateRangeSelection(range) &&
          dateAdapter.isValid(range.startDate) &&
          !isOutsideAllowedDates(range.startDate)
        ) {
          return dateAdapter.isSame(range.startDate, date, "day");
        }
        return false;
      });
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );

  const isSelectedSpan = useCallback(
    (date: TDate) => {
      if (selectionVariant === "single") {
        return false;
      }
      const dateRanges = Array.isArray(selectedDate)
        ? selectedDate
        : [selectedDate];
      return dateRanges.some((range) => {
        if (
          (selectionVariant === "range" || selectionVariant === "offset") &&
          isDateRangeSelection(range) &&
          dateAdapter.isValid(range.startDate) &&
          dateAdapter.isValid(range.endDate) &&
          !isOutsideAllowedDates(range.startDate) &&
          !isOutsideAllowedDates(range.endDate)
        ) {
          return (
            dateAdapter.compare(date, range.startDate) > 0 &&
            dateAdapter.compare(date, range.endDate) < 0
          );
        }
        return false;
      });
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
  );

  const isSelectedEnd = useCallback(
    (date: TDate) => {
      if (selectionVariant === "single") {
        return false;
      }
      const dateRanges = Array.isArray(selectedDate)
        ? selectedDate
        : [selectedDate];
      return dateRanges.some((range) => {
        if (
          (selectionVariant === "range" || selectionVariant === "offset") &&
          isDateRangeSelection(range) &&
          dateAdapter.isValid(range.endDate) &&
          !isOutsideAllowedDates(range.endDate)
        ) {
          return dateAdapter.isSame(range.endDate, date, "day");
        }
        return false;
      });
    },
    [dateAdapter, isOutsideAllowedDates, selectionVariant, selectedDate],
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
        isHovered,
        isSelected,
        setHoveredDate,
        isSameDay,
        setSelectedDate,
        isSelectedStart,
        isSelectedSpan,
        isSelectedEnd,
        isHoveredStart,
        isHoveredSpan,
        isHoveredEnd,
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
      isHoveredStart,
      isHoveredSpan,
      isHoveredEnd,
      isSameDay,
      isSelectedStart,
      isSelectedSpan,
      isSelectedEnd,
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
    state: { selectionVariant },
    helpers: {
      setSelectedDate,
      isSameDay,
      isSelected,
      isSelectedStart,
      isSelectedSpan,
      isSelectedEnd,
      isHovered,
      isHoveredStart,
      isHoveredSpan,
      isHoveredEnd,
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
  const selectedStart = isSelectedStart(date);
  const selectedSpan = isSelectedSpan(date);
  const selectedEnd = isSelectedEnd(date);
  const selectedOnSameDay = isSameDay(date);

  const hovered = isHovered(date);
  const hoveredStart = isHoveredStart(date);
  const hoveredSpan = isHoveredSpan(date);
  const hoveredEnd = isHoveredEnd(date);

  return {
    handleClick,
    handleKeyDown,
    status: {
      hovered,
      selected,
      selectedStart,
      selectedSpan,
      selectedEnd,
      hoveredStart,
      hoveredSpan,
      hoveredEnd,
    },
    dayProps: {
      className: clsx({
        [withBaseName("selected")]:
          selectionVariant === "single" ? selected : undefined,
        [withBaseName("selectedStart")]:
          selectionVariant !== "single" ? selectedStart : undefined,
        [withBaseName("selectedSpan")]:
          selectionVariant !== "single" ? selectedSpan : undefined,
        [withBaseName("selectedEnd")]:
          selectionVariant !== "single" ? selectedEnd : undefined,
        [withBaseName("selectedSameDay")]:
          selectionVariant !== "single" && selectedOnSameDay,
        [withBaseName("hoveredStart")]:
          selectionVariant !== "single" && hoveredStart,
        [withBaseName("hoveredSpan")]:
          selectionVariant !== "single" && hoveredSpan,
        [withBaseName("hoveredEnd")]:
          selectionVariant !== "single" && hoveredEnd,
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
