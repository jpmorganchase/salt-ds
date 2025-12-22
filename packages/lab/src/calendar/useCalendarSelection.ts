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
 */
export type SingleDateSelection<
  TDate extends DateFrameworkType = DateFrameworkType,
> = TDate;

/**
 * Type representing a date range selection.
 * @template TDate - The type of the date object.
 */
export type DateRangeSelection<
  TDate extends DateFrameworkType = DateFrameworkType,
> = {
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
export function isDateRangeSelection<
  TDate extends DateFrameworkType = DateFrameworkType,
>(value: unknown): value is DateRangeSelection<TDate> {
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
 */
export interface UseCalendarSelectionBaseProps<Selection> {
  /**
   * Determines if a date is outside the allowed date range.
   * @param date - The date to check.
   * @returns 0 if inside the date range, -1 if before the min date, 1 if after the max date.
   */
  isOutsideAllowedDates?: (date: DateFrameworkType) => -1 | 0 | 1;
  /**
   * Function to determine if a day is selectable.
   * @param date - The date to check.
   * @returns `true` if the day is selectable, otherwise `false`.
   */
  isDaySelectable?: (date: DateFrameworkType) => boolean;
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
  select?: (
    previousSelectedDate: Selection,
    newDate: DateFrameworkType,
  ) => Selection;
  /**
   * Function to calculate the start date offset.
   * @param date - The date to offset.
   * @returns The offset start date.
   */
  startDateOffset?: (date: DateFrameworkType) => DateFrameworkType;
  /**
   * Function to calculate the end date offset.
   * @param date - The date to offset.
   * @returns The offset end date.
   */
  endDateOffset?: (date: DateFrameworkType) => DateFrameworkType;
}

export type UseCalendarSelectionSingleProps =
  UseCalendarSelectionBaseProps<SingleDateSelection<DateFrameworkType> | null> & {
    selectionVariant: "single";
    multiselect?: false;
  };

export type UseCalendarSelectionMultiselectSingleProps =
  UseCalendarSelectionBaseProps<
    Array<SingleDateSelection<DateFrameworkType>>
  > & {
    selectionVariant: "single";
    multiselect: true;
  };

export type UseCalendarSelectionRangeProps = UseCalendarSelectionBaseProps<
  DateRangeSelection<DateFrameworkType>
> & {
  selectionVariant: "range";
  multiselect?: false;
};

export type UseCalendarSelectionMultiselectRangeProps =
  UseCalendarSelectionBaseProps<
    Array<DateRangeSelection<DateFrameworkType>>
  > & {
    selectionVariant: "range";
    multiselect: true;
  };

export type UseCalendarSelectionOffsetProps = UseCalendarSelectionBaseProps<
  DateRangeSelection<DateFrameworkType>
> & {
  selectionVariant: "offset";
  multiselect?: false;
};

export type UseCalendarSelectionMultiselectOffsetProps =
  UseCalendarSelectionBaseProps<
    Array<DateRangeSelection<DateFrameworkType>>
  > & {
    selectionVariant: "offset";
    multiselect: true;
  };

export type UseCalendarSelectionProps =
  | UseCalendarSelectionSingleProps
  | UseCalendarSelectionMultiselectSingleProps
  | UseCalendarSelectionRangeProps
  | UseCalendarSelectionMultiselectRangeProps
  | UseCalendarSelectionOffsetProps
  | UseCalendarSelectionMultiselectOffsetProps;

function isMultiselect(
  props: UseCalendarSelectionProps,
): props is
  | UseCalendarSelectionMultiselectSingleProps
  | UseCalendarSelectionMultiselectRangeProps
  | UseCalendarSelectionMultiselectOffsetProps {
  return props.multiselect === true;
}

function selectDateRange(
  dateAdapter: SaltDateAdapter,
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

function selectMultiselectDateRange(
  dateAdapter: SaltDateAdapter,
  previousSelectedDate: DateRangeSelection<DateFrameworkType>[],
  newDate: DateFrameworkType,
): DateRangeSelection<DateFrameworkType>[] {
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

export function useCalendarSelection(props: UseCalendarSelectionProps) {
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
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const [selectedDate, setSelectedDateState] = useControlled({
    controlled: selectedDateProp,
    default: defaultSelectedDate,
    name: "Calendar",
    state: "selectedDate",
  });

  const setSelectedDate = useCallback(
    (
      event: SyntheticEvent<HTMLButtonElement>,
      newSelectedDate: DateFrameworkType,
    ) => {
      if (!isDaySelectable || isDaySelectable(newSelectedDate)) {
        const handleSelectionChange = <
          U extends
            | (DateFrameworkType | null)
            | DateFrameworkType[]
            | (DateRangeSelection<DateFrameworkType> | null)
            | DateRangeSelection<DateFrameworkType>[],
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
                SingleDateSelection<DateFrameworkType>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectSingleProps["select"];
              const updatedSelection: Array<
                SingleDateSelection<DateFrameworkType>
              > = select
                ? select(multipleSingleSelectedDate ?? [], newSelectedDate)
                : [...(multipleSingleSelectedDate ?? []), newSelectedDate];

              const changeHandler =
                onSelectionChange as UseCalendarSelectionMultiselectSingleProps["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const singleSelectedDate =
                selectedDate as SingleDateSelection<DateFrameworkType> | null;
              const select =
                selectProp as UseCalendarSelectionSingleProps["select"];
              const updatedSelection: SingleDateSelection<DateFrameworkType> | null =
                select
                  ? select(singleSelectedDate, newSelectedDate)
                  : newSelectedDate;

              const changeHandler =
                onSelectionChange as UseCalendarSelectionSingleProps["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            }
            break;
          }
          case "range": {
            if (isMultiselect(props)) {
              const multipleRangeSelectedDate = selectedDate as Array<
                DateRangeSelection<DateFrameworkType>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectRangeProps["select"];
              const updatedSelection: DateRangeSelection<DateFrameworkType>[] =
                select
                  ? select(multipleRangeSelectedDate ?? [], newSelectedDate)
                  : selectMultiselectDateRange(
                      dateAdapter,
                      multipleRangeSelectedDate ?? [],
                      newSelectedDate,
                    );

              const changeHandler =
                onSelectionChange as UseCalendarSelectionMultiselectRangeProps["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const rangeSelectedDate =
                selectedDate as DateRangeSelection<DateFrameworkType>;
              const select =
                selectProp as UseCalendarSelectionRangeProps["select"];
              const updatedSelection: DateRangeSelection<DateFrameworkType> =
                select
                  ? select(rangeSelectedDate, newSelectedDate)
                  : selectDateRange(
                      dateAdapter,
                      rangeSelectedDate,
                      newSelectedDate,
                    );

              const changeHandler =
                onSelectionChange as UseCalendarSelectionRangeProps["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            }
            break;
          }
          case "offset": {
            const { startDateOffset, endDateOffset } = props;
            if (isMultiselect(props)) {
              const multipleOffsetSelectedDate = selectedDate as Array<
                DateRangeSelection<DateFrameworkType>
              >;
              const select =
                selectProp as UseCalendarSelectionMultiselectOffsetProps["select"];
              const updatedSelection: DateRangeSelection<DateFrameworkType>[] =
                select
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
                onSelectionChange as UseCalendarSelectionMultiselectOffsetProps["onSelectionChange"];
              handleSelectionChange(updatedSelection, changeHandler);
            } else {
              const offsetSelectedDate =
                selectedDate as DateRangeSelection<DateFrameworkType>;
              const select =
                selectProp as UseCalendarSelectionOffsetProps["select"];
              const updatedSelection: DateRangeSelection<DateFrameworkType> =
                select
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
                onSelectionChange as UseCalendarSelectionOffsetProps["onSelectionChange"];
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
    (date: DateFrameworkType) => {
      if (!selectedDate) {
        return false;
      }
      if (selectionVariant === "single") {
        const singleDates = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as DateFrameworkType[];
        return singleDates.some((singleDate) =>
          dateAdapter.isSame(singleDate, date, "day"),
        );
      }
      return false;
    },
    [dateAdapter, selectedDate, selectionVariant],
  );

  const isSameDay = useCallback(
    (date: DateFrameworkType) => {
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
    (date: DateFrameworkType) => {
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
    (date: DateFrameworkType) => {
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
    (date: DateFrameworkType) => {
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

export function useCalendarSelectionDay({ date }: { date: DateFrameworkType }) {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
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
