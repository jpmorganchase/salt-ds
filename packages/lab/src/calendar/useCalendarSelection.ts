import { makePrefixer, useControlled } from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
} from "@salt-ds/date-adapters";
import { clsx } from "clsx";
import {
  type KeyboardEventHandler,
  type MouseEventHandler,
  type SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import { useLocalization } from "../localization-provider";
import { useCalendarContext } from "./internal/CalendarContext";

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
   * The start date of the range, or null if empty
   */
  startDate?: TDate | null;
  /**
   * The end date of the range, or null if empty
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
  value: unknown,
): value is DateRangeSelection<TDate> {
  return (
    !!value &&
    !Array.isArray(value) &&
    typeof value === "object" &&
    ("startDate" in value || "endDate" in value)
  );
}

export type SelectionVariant = "single" | "range" | "offset";

/**
 * Base properties for calendar UseCalendarSelection hook.
 * @template TDate - The type of the date object.
 */
export interface UseCalendarSelectionBaseProps<
  TDate extends DateFrameworkType,
  Selection,
> {
  /**
   * Determines if a date is outside the allowed date range.
   * @param date - The date to check.
   * @returns 0 if inside the date range, -1 if before the min date, 1 if after the max date.
   */
  isOutsideAllowedDates?: (date: TDate) => -1 | 0 | 1;
  /**
   * Function to determine if a day is selectable.
   * @param date - The date to check.
   * @returns `true` if the day is selectable, otherwise `false`.
   */
  isDaySelectable?: (date: TDate) => boolean;
  /**
   * If `true`, the calendar will be multiselect.
   */
  multiselect?: boolean;
  /**
   * The selection variant, set to "single".
   */
  selectionVariant: SelectionVariant;
  /**
   * The currently selected date.
   */
  selectedDate?: Selection;
  /**
   * The default selected date.
   */
  defaultSelectedDate?: Selection;
  /**
   * Callback fired when the selected date changes.
   * @param event - The synthetic event.
   * @param selectedDate - The new selected date.
   */
  onSelectionChange?: (event: SyntheticEvent, selectedDate: Selection) => void;
  /**
   * A pure function to manage the selected date for uncontrolled use-cases.
   * Return the selection based on the previous selection and the new date.
   * @param previousSelectedDate
   * @param newDate
   */
  select?: (previousSelectedDate: Selection, newDate: TDate) => Selection;
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

export type UseCalendarSelectionSingleProps<TDate extends DateFrameworkType> =
  UseCalendarSelectionBaseProps<TDate, SingleDateSelection<TDate> | null> & {
    selectionVariant: "single";
    multiselect?: false;
  };

export type UseCalendarSelectionMultiselectSingleProps<
  TDate extends DateFrameworkType,
> = UseCalendarSelectionBaseProps<TDate, Array<SingleDateSelection<TDate>>> & {
  selectionVariant: "single";
  multiselect: true;
};

export type UseCalendarSelectionRangeProps<TDate extends DateFrameworkType> =
  UseCalendarSelectionBaseProps<TDate, DateRangeSelection<TDate>> & {
    selectionVariant: "range";
    multiselect?: false;
  };

export type UseCalendarSelectionMultiselectRangeProps<
  TDate extends DateFrameworkType,
> = UseCalendarSelectionBaseProps<TDate, Array<DateRangeSelection<TDate>>> & {
  selectionVariant: "range";
  multiselect: true;
};

export type UseCalendarSelectionOffsetProps<TDate extends DateFrameworkType> =
  UseCalendarSelectionBaseProps<TDate, DateRangeSelection<TDate>> & {
    selectionVariant: "offset";
    multiselect?: false;
  };

export type UseCalendarSelectionMultiselectOffsetProps<
  TDate extends DateFrameworkType,
> = UseCalendarSelectionBaseProps<TDate, Array<DateRangeSelection<TDate>>> & {
  selectionVariant: "offset";
  multiselect: true;
};

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
    selectedDate: selectedDateProp,
    defaultSelectedDate,
    onSelectionChange,
    isDaySelectable = () => true,
    isOutsideAllowedDates = () => 0,
    select: selectProp,
    selectionVariant,
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
            const { startDateOffset, endDateOffset } = props;
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
                      startDate: newSelectedDate,
                      endDate: endDateOffset
                        ? endDateOffset(newSelectedDate)
                        : newSelectedDate,
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
                    startDate: startDateOffset
                      ? startDateOffset(newSelectedDate)
                      : newSelectedDate,
                    endDate: endDateOffset
                      ? endDateOffset(newSelectedDate)
                      : newSelectedDate,
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
          isOutsideAllowedDates(range.startDate) === 0
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
          isOutsideAllowedDates(range.startDate) === 0 &&
          isOutsideAllowedDates(range.endDate) === 0
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
          isOutsideAllowedDates(range.endDate) === 0
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
        selectedDate,
      },
      helpers: {
        isSelected,
        isSameDay,
        setSelectedDate,
        isSelectedStart,
        isSelectedSpan,
        isSelectedEnd,
      },
    }),
    [
      selectedDate,
      isSelected,
      isSameDay,
      isSelectedStart,
      isSelectedSpan,
      isSelectedEnd,
      setSelectedDate,
    ],
  );
}

const withBaseName = makePrefixer("saltCalendarDay");

export function useCalendarSelectionDay<TDate extends DateFrameworkType>({
  date,
}: {
  date: TDate;
}) {
  const { dateAdapter } = useLocalization<TDate>();
  const {
    state: { selectionVariant, minDate, maxDate },
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

  const formattedDate = dateAdapter.format(date, "dddd D MMMM YYYY");

  // Determine aria-label based on selection state
  let ariaLabel = formattedDate;
  if (selectionVariant === "single") {
    if (selected) {
      ariaLabel = `Selected date: ${formattedDate}`;
    }
  } else if (selectedStart) {
    ariaLabel = `Start selected range: ${formattedDate}`;
  } else if (selectedEnd) {
    ariaLabel = `End selected range: ${formattedDate}`;
  } else if (selectedSpan) {
    ariaLabel = `In selected range: ${formattedDate}`;
  } else if (hoveredStart) {
    ariaLabel = `Start new range: ${formattedDate}`;
  } else if (hoveredEnd) {
    ariaLabel = `Complete new range: ${formattedDate}`;
  } else {
    if (dateAdapter.isSame(minDate, date, "day")) {
      ariaLabel = `${formattedDate}, minimum date`;
    } else if (dateAdapter.isSame(maxDate, date, "day")) {
      ariaLabel = `${formattedDate}, maximum date`;
    }
  }

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
      "aria-disabled":
        isDaySelectable && !isDaySelectable(date) ? "true" : undefined,
      "aria-label": ariaLabel,
    },
  };
}
