import {
  type ResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
  useControlled,
} from "@salt-ds/core";
import type { DateFrameworkType, Timezone } from "@salt-ds/date-adapters";
import { type SyntheticEvent, useCallback, useEffect, useMemo } from "react";
import { useLocalization } from "../localization-provider";
import {
  createRangeSelectionAnnouncement,
  createSingleSelectionAnnouncement,
} from "./internal/createAnnouncement";
import { generateDatesForMonth } from "./internal/utils";
import {
  type DateRangeSelection,
  isDateRangeSelection,
  type SingleDateSelection,
  type UseCalendarSelectionMultiselectOffsetProps,
  type UseCalendarSelectionMultiselectRangeProps,
  type UseCalendarSelectionMultiselectSingleProps,
  type UseCalendarSelectionOffsetProps,
  type UseCalendarSelectionProps,
  type UseCalendarSelectionRangeProps,
  type UseCalendarSelectionSingleProps,
  useCalendarSelection,
} from "./useCalendarSelection";
import {
  type CreateAnnouncement,
  useDateSelectionAnnouncer,
} from "./useDateSelectionAnnouncer";

/**
 * Base properties for the UseCalendar hook.
 */
interface UseCalendarBaseProps {
  /**
   * Factory method for date selection live announcements or null to silence announcements
   */
  createAnnouncement?: CreateAnnouncement | null;
  /**
   * The default visible month.
   */
  defaultVisibleMonth?: DateFrameworkType;
  /**
   * The currently focused date in the calendar, or null if no date is focused.
   */
  focusedDate?: DateFrameworkType | null;
  /**
   * The currently hovered date.
   */
  hoveredDate?: DateFrameworkType | null;
  /**
   * Function to determine if a day is visible.
   * @param date - The date to check.
   * @returns `true` if the day is visible, otherwise `false`.
   */
  isDayVisible?: (date: DateFrameworkType) => boolean;
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
    date: DateFrameworkType | null,
  ) => void;
  /**
   * Callback fired when the hovered date changes.
   * @param event - The synthetic event.
   * @param hoveredDate - The new hovered date.
   */
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate: DateFrameworkType | null,
  ) => void;
  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event or null if triggered by code.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (
    event: SyntheticEvent | null,
    visibleMonth: DateFrameworkType,
  ) => void;
  /**
   * Function to determine if a day is unselectable.
   * @param date - The date to check.
   * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
   */
  isDayUnselectable?: (date: DateFrameworkType) => string | false | undefined;
  /**
   * Function to determine if a day is highlighted.
   * @param date - The date to check.
   * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
   */
  isDayHighlighted?: (date: DateFrameworkType) => string | false | undefined;
  /**
   * If `true`, hides dates that are out of the selectable range.
   */
  hideOutOfRangeDates?: boolean;
  /**
   * The minimum selectable date.
   */
  minDate?: DateFrameworkType;
  /**
   * The maximum selectable date.
   */
  maxDate?: DateFrameworkType;
  /**
   * Number of visible months, maximum 12, defaults to 1.
   */
  numberOfVisibleMonths?: ResponsiveProp<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >;
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
  visibleMonth?: DateFrameworkType;
}

/**
 * UseCalendar hook props for a single date selection.
 */
export interface UseCalendarSingleProps
  extends UseCalendarSelectionSingleProps,
    UseCalendarBaseProps {}

/**
 * UseCalendar hook props for a multi-select, single date selection.
 */
export interface UseCalendarMultiselectSingleProps
  extends UseCalendarSelectionMultiselectSingleProps,
    Omit<UseCalendarBaseProps, "multiselect"> {}

/**
 * UseCalendar hook props for a date range selection.
 */
export interface UseCalendarRangeProps
  extends UseCalendarSelectionRangeProps,
    UseCalendarBaseProps {}

/**
 * UseCalendar hook props for a multi-select, date range selection.
 */
export interface UseCalendarMultiselectRangeProps
  extends UseCalendarSelectionMultiselectRangeProps,
    Omit<UseCalendarBaseProps, "multiselect"> {}

/**
 * UseCalendar hook props for an offset date selection.
 */
export interface UseCalendarOffsetProps
  extends UseCalendarSelectionOffsetProps,
    UseCalendarBaseProps {}

/**
 * UseCalendar hook props for a multi-select, offset selection.
 */
export interface UseCalendarMultiselectOffsetProps
  extends UseCalendarSelectionMultiselectOffsetProps,
    Omit<UseCalendarBaseProps, "multiselect"> {}

/**
 * UseCalendar hook props, wth the selection variant determining the return type of the date selection
 */
export type UseCalendarProps =
  | UseCalendarSingleProps
  | UseCalendarMultiselectSingleProps
  | UseCalendarRangeProps
  | UseCalendarMultiselectRangeProps
  | UseCalendarOffsetProps
  | UseCalendarMultiselectOffsetProps;

/**
 * Default function to determine if a day is unselectable.
 * @returns `false` indicating the day is selectable.
 */
const defaultIsDayUnselectable = (): string | false => false;

/**
 * Default function to determine if a day is highlighted.
 * @returns `false` indicating the day is not highlighted.
 */
const defaultIsDayHighlighted = (): string | false => false;

/**
 * Represents the return type of the useCalendar hook.
 */
export interface UseCalendarReturn {
  /**
   * The state of the calendar.
   */
  state: {
    /**
     * The currently visible month in the calendar.
     */
    visibleMonth: DateFrameworkType;

    /**
     * The currently focused date in the calendar, or null if no date is focused.
     */
    focusedDate: DateFrameworkType | null;

    /**
     *  Focusable dates based on current state
     */
    focusableDate: DateFrameworkType | null;

    /**
     * Ref to attach to the focused element,enabling focus to be controlled.
     */
    focusedDateRef?: React.MutableRefObject<HTMLButtonElement | null>;

    /**
     * The minimum selectable date in the calendar.
     */
    minDate: DateFrameworkType;

    /**
     * The maximum selectable date in the calendar.
     */
    maxDate: DateFrameworkType;

    /**
     * The selection variant of the calendar, indicating the type of selection allowed.
     */
    selectionVariant: "single" | "range" | "offset";

    /**
     * Whether to hide dates that are out of the selectable range.
     */
    hideOutOfRangeDates?: boolean;

    /**
     * Number of visible months
     */
    numberOfVisibleMonths: number;
    /**
     * Specifies the timezone behavior:
     * - If undefined, the timezone will be derived from the passed date, or from `defaultSelectedDate`/`selectedDate`.
     * - If set to "default", the default timezone of the date library will be used.
     * - If set to "system", the local system's timezone will be applied.
     * - If set to "UTC", the time will be returned in UTC.
     * - If set to a valid IANA timezone identifier, the time will be returned for that specific timezone.
     */
    timezone?: Timezone;
  };

  /**
   * Helper functions for interacting with the calendar.
   */
  helpers: {
    /**
     * Sets the visible month in the calendar.
     *
     * @param event - The synthetic event or null if triggered by code.
     * @param newVisibleMonth - The new visible month to set.
     */
    setVisibleMonth: (
      event: SyntheticEvent | null,
      newVisibleMonth: DateFrameworkType,
    ) => void;

    /**
     * Sets the focused date in the calendar.
     *
     * @param event - The synthetic event or null if triggered by code.
     * @param date - The new date to focus.
     */
    setFocusedDate: (
      event: SyntheticEvent | null,
      date: DateFrameworkType | null,
    ) => void;

    /**
     * Determines if a day is unselectable.
     *
     * @param date - The date to check.
     * @returns A string reason if the day is unselectable, otherwise `false` or `undefined`.
     */
    isDayUnselectable: (date: DateFrameworkType) => string | false | undefined;

    /**
     * Determines if a day is highlighted.
     *
     * @param date - The date to check.
     * @returns A string reason if the day is highlighted, otherwise `false` or `undefined`.
     */
    isDayHighlighted: (date: DateFrameworkType) => string | false | undefined;

    /**
     * Determines if a day is visible in the calendar.
     *
     * @param date - The date to check.
     * @returns `true` if the day is visible, otherwise `false`.
     */
    isDayVisible: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a date is outside the allowed date range.
     *
     * @param date - The date to check.
     * * @returns -1 if before the allowed range, 0 if inside, 1 if after.
     */
    isOutsideAllowedDates: (date: DateFrameworkType) => -1 | 0 | 1;

    /**
     * Determines if a month is outside the allowed range.
     *
     * @param date - The date to check.
     * @returns `true` if the month is outside the allowed range, otherwise `false`.
     */
    isOutsideAllowedMonths: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a year is outside the allowed range.
     *
     * @param date - The date to check.
     * @returns `true` if the year is outside the allowed range, otherwise `false`.
     */
    isOutsideAllowedYears: (date: DateFrameworkType) => boolean;

    /**
     * Determines if the date range is on the same day
     *
     * @param date - The range to check.
     * @returns `true` if the range start and end date are the same
     */
    isSameDay: (date: DateFrameworkType) => boolean;

    /**
     * Sets the selected date in the calendar.
     *
     * @param event - The event triggering the change.
     * @param newSelectedDate - The new date to select.
     */
    setSelectedDate: (
      event:
        | React.KeyboardEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLButtonElement, MouseEvent>,
      newSelectedDate: DateFrameworkType,
    ) => void;

    /**
     * Determines if a date is selected.
     *
     * @param date - The date to check.
     * @returns `true` if the date is selected, otherwise `false`.
     */
    isSelected: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a date is hovered.
     *
     * @param date - The date to check.
     * @returns `true` if the date is hovered, otherwise `false`.
     */
    isHovered: (date: DateFrameworkType) => boolean;

    /**
     * Sets the hovered date in the calendar.
     *
     * @param event - The event triggering the change.
     * @param newHoveredDate - The new date to hover.
     */
    setHoveredDate: (
      event: SyntheticEvent,
      newHoveredDate: DateFrameworkType | null,
    ) => void;

    /**
     * Determines if a date is part of a selected span.
     *
     * @param date - The date to check.
     * @returns `true` if the date is part of a selected span, otherwise `false`.
     */
    isSelectedSpan: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a date is the start of a selected range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the start of a selected range, otherwise `false`.
     */
    isSelectedStart: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a date is the end of a selected range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the end of a selected range, otherwise `false`.
     */
    isSelectedEnd: (date: DateFrameworkType) => boolean;

    /**
     * Determines if the hovered and a new date range would be created, if selected.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the start of a hovered offset, otherwise `false`.
     */
    isHoveredStart: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a date is part of a hovered range.
     *
     * @param date - The date to check.
     * @returns `true` if the date is part of a hovered offset, otherwise `false`.
     */
    isHoveredSpan: (date: DateFrameworkType) => boolean;

    /**
     * Determines if the hovered and a date range would be completed, if selected.
     *
     * @param date - The date to check.
     * @returns `true` if the date is the end of a hovered offset, otherwise `false`.
     */
    isHoveredEnd: (date: DateFrameworkType) => boolean;

    /**
     * Determines if a day is selectable.
     *
     * @param date - The date to check.
     * @returns `true` if the day is selectable, otherwise `false`.
     */
    isDaySelectable: (date: DateFrameworkType) => boolean;
  };
}

export function useCalendar(props: UseCalendarProps): UseCalendarReturn {
  const {
    dateAdapter,
    defaultDates: { minDate: defaultMinDate, maxDate: defaultMaxDate },
  } = useLocalization<DateFrameworkType>();
  const {
    createAnnouncement,
    timezone,
    defaultSelectedDate,
    defaultVisibleMonth = dateAdapter.today(timezone),
    hideOutOfRangeDates,
    hoveredDate: hoveredDateProp,
    focusedDate: focusedDateProp,
    focusedDateRef,
    isDayHighlighted = defaultIsDayHighlighted,
    isDayUnselectable = defaultIsDayUnselectable,
    multiselect,
    maxDate = defaultMaxDate,
    minDate = defaultMinDate,
    numberOfVisibleMonths = 1,
    onHoveredDateChange,
    onSelectionChange,
    onVisibleMonthChange,
    onFocusedDateChange,
    select,
    selectedDate: selectedDateProp,
    selectionVariant,
    visibleMonth: visibleMonthProp,
    startDateOffset,
    endDateOffset,
  } = props;
  const { matchedBreakpoints } = useBreakpoint();

  const responsiveNumberOfVisibleMonths =
    resolveResponsiveValue(numberOfVisibleMonths, matchedBreakpoints) ?? 1;

  const [hoveredDate, setHoveredDateState] = useControlled({
    controlled: hoveredDateProp,
    default: undefined,
    name: "Calendar",
    state: "hoveredDate",
  });

  const setHoveredDate = useCallback(
    (event: SyntheticEvent, date: DateFrameworkType | null) => {
      setHoveredDateState(date);
      onHoveredDateChange?.(event, date);
    },
    [onHoveredDateChange],
  );

  const [visibleMonth, setVisibleMonthState] = useControlled({
    controlled: useMemo(
      () =>
        visibleMonthProp
          ? dateAdapter.startOf(visibleMonthProp, "month")
          : undefined,
      [visibleMonthProp],
    ),
    // biome-ignore lint/correctness/useExhaustiveDependencies: just on mount
    default: useMemo(
      () => dateAdapter.startOf(defaultVisibleMonth, "month"),
      [],
    ),
    name: "Calendar",
    state: "visibleMonth",
  });

  const isOutsideAllowedDates = useCallback(
    (date: DateFrameworkType): -1 | 0 | 1 => {
      if (dateAdapter.compare(date, minDate) < 0) {
        return -1;
      }
      if (dateAdapter.compare(date, maxDate) > 0) {
        return 1;
      }
      return 0;
    },
    [dateAdapter, maxDate, minDate],
  );

  const isOutsideAllowedMonths = useCallback(
    (date: DateFrameworkType) => {
      const startOfMonth = dateAdapter.startOf(date, "month");
      const endOfMonth = dateAdapter.endOf(date, "month");
      return (
        dateAdapter.compare(endOfMonth, minDate) < 0 ||
        dateAdapter.compare(startOfMonth, maxDate) > 0
      );
    },
    [dateAdapter, minDate, maxDate],
  );

  const isOutsideAllowedYears = useCallback(
    (date: DateFrameworkType) => {
      const startOfYear = dateAdapter.startOf(date, "year");
      const endOfYear = dateAdapter.endOf(date, "year");
      return (
        dateAdapter.compare(endOfYear, minDate) < 0 ||
        dateAdapter.compare(startOfYear, maxDate) > 0
      );
    },
    [dateAdapter, minDate, maxDate],
  );

  const isDaySelectable = useCallback(
    (date?: DateFrameworkType) =>
      !(date && (isDayUnselectable(date) || isOutsideAllowedDates(date) !== 0)),
    [isDayUnselectable, isOutsideAllowedDates],
  );

  const isDayVisible = useCallback(
    (date?: DateFrameworkType | null) => {
      if (!date) {
        return false;
      }
      const startInsideDays = dateAdapter.startOf(visibleMonth, "month");
      if (dateAdapter.compare(date, startInsideDays) < 0) return false;

      const endVisibleMonth = dateAdapter.add(visibleMonth, {
        months: responsiveNumberOfVisibleMonths - 1,
      });
      const endInsideDays = dateAdapter.endOf(endVisibleMonth, "month");

      return !(dateAdapter.compare(date, endInsideDays) > 0);
    },
    [dateAdapter, responsiveNumberOfVisibleMonths, visibleMonth],
  );

  const selectionManager = useCalendarSelection({
    defaultSelectedDate,
    selectedDate: selectedDateProp,
    isDaySelectable,
    isOutsideAllowedDates,
    multiselect,
    onSelectionChange,
    select,
    selectionVariant,
    startDateOffset,
    endDateOffset,
  } as UseCalendarSelectionProps);

  const {
    state: { selectedDate },
    helpers: {
      isSelected,
      isSameDay,
      setSelectedDate,
      isSelectedStart,
      isSelectedSpan,
      isSelectedEnd,
    },
  } = selectionManager;

  const isHovered = useCallback(
    (date: DateFrameworkType) => {
      return !!hoveredDate && dateAdapter.isSame(date, hoveredDate, "day");
    },
    [dateAdapter, hoveredDate],
  );

  const isHoveredStart = useCallback(
    (date: DateFrameworkType) => {
      if (
        selectionVariant === "range" &&
        hoveredDate &&
        dateAdapter.isSame(date, hoveredDate, "day")
      ) {
        const dateRanges = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as DateRangeSelection[];
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
        const startDate = startDateOffset
          ? startDateOffset(hoveredDate)
          : hoveredDate;
        return (
          dateAdapter.isSame(date, startDate, "day") &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }
      return false;
    },
    [dateAdapter, selectionVariant, selectedDate, hoveredDate, isDaySelectable],
  );

  const getDefaultFocusedDate = () => {
    if (
      selectedDate &&
      (selectionVariant === "range" || selectionVariant === "offset")
    ) {
      const getFocusableDate = (
        result: DateFrameworkType[],
        selection: DateRangeSelection,
      ) => {
        if (selection?.startDate && isDayVisible(selection.startDate)) {
          return [...result, selection.startDate];
        }
        if (selection?.endDate && isDayVisible(selection.endDate)) {
          return [...result, selection.endDate];
        }
        return result;
      };
      let focusableSelectedDates: DateRangeSelection | DateRangeSelection[];
      if (!multiselect) {
        focusableSelectedDates = [selectedDate as DateRangeSelection];
      } else {
        focusableSelectedDates = selectedDate as DateRangeSelection[];
      }
      const selectionInMonth = focusableSelectedDates
        .reduce(getFocusableDate, [])
        .sort((a, b) => dateAdapter.compare(a, b));
      if (selectionInMonth.length > 0) {
        return selectionInMonth[0];
      }
    } else if (selectedDate && selectionVariant === "single") {
      const focusableSelectedDate = multiselect
        ? (selectedDate as SingleDateSelection[])?.[0]
        : (selectedDate as SingleDateSelection);
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

  const focusableDate = useMemo(() => {
    const dates: DateFrameworkType[] = [];

    if (Array.isArray(selectedDate)) {
      for (const selection of selectedDate) {
        if (isDateRangeSelection(selection)) {
          if (selection.startDate && isDayVisible(selection.startDate)) {
            dates.push(selection.startDate);
          } else if (selection.endDate && isDayVisible(selection.endDate)) {
            dates.push(selection.endDate);
          }
        } else if (isDayVisible(selection as DateFrameworkType)) {
          dates.push(selection as DateFrameworkType);
        }
      }
    } else if (selectedDate) {
      if (isDateRangeSelection(selectedDate)) {
        if (selectedDate.startDate && isDayVisible(selectedDate.startDate)) {
          dates.push(selectedDate.startDate);
        } else if (selectedDate.endDate && isDayVisible(selectedDate.endDate)) {
          dates.push(selectedDate.endDate);
        }
      } else if (isDayVisible(selectedDate)) {
        dates.push(selectedDate);
      }
    }

    if (
      focusedDate &&
      visibleMonth &&
      dateAdapter.isSame(focusedDate, visibleMonth, "month")
    ) {
      dates.push(focusedDate);
      return dates[0];
    }

    // Defaults
    if (
      dates.length === 0 &&
      isDaySelectable(dateAdapter.today(timezone)) &&
      isDayVisible(dateAdapter.today(timezone))
    ) {
      dates.push(dateAdapter.today(timezone));
    }
    if (dates.length === 0 || !dates.some(isDayVisible)) {
      const firstSelectableDate = generateDatesForMonth(
        dateAdapter,
        visibleMonth,
      ).find((visibleDay) => visibleDay && isDaySelectable(visibleDay));
      if (firstSelectableDate) {
        dates.push(firstSelectableDate);
      }
    }

    return dates.length ? dates[0] : null;
  }, [
    dateAdapter,
    focusedDate,
    isDaySelectable,
    isDayVisible,
    selectedDate,
    timezone,
    visibleMonth,
  ]);

  const isHoveredSpan = useCallback(
    (date: DateFrameworkType) => {
      if (selectionVariant === "range") {
        const dateRanges = Array.isArray(selectedDate)
          ? selectedDate
          : [selectedDate];
        return dateRanges.some((range) => {
          if (
            isDateRangeSelection(range) &&
            dateAdapter.isValid(range.startDate) &&
            !dateAdapter.isValid(range.endDate) &&
            isOutsideAllowedDates(range.startDate) === 0 &&
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
        const startDate = startDateOffset
          ? startDateOffset(hoveredDate)
          : hoveredDate;
        const endDate = endDateOffset
          ? endDateOffset(hoveredDate)
          : hoveredDate;
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
    (date: DateFrameworkType) => {
      if (
        selectionVariant === "range" &&
        hoveredDate &&
        dateAdapter.isSame(date, hoveredDate, "day")
      ) {
        const dateRanges = (
          Array.isArray(selectedDate) ? selectedDate : [selectedDate]
        ) as DateRangeSelection[];
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
        const endDate = endDateOffset
          ? endDateOffset(hoveredDate)
          : hoveredDate;
        return (
          dateAdapter.isSame(date, endDate, "day") &&
          (!isDaySelectable || isDaySelectable(date))
        );
      }
      return false;
    },
    [dateAdapter, selectionVariant, selectedDate, hoveredDate, isDaySelectable],
  );

  const defaultCreateAnnouncement =
    selectionVariant === "single"
      ? createSingleSelectionAnnouncement
      : createRangeSelectionAnnouncement;
  const { announce } = useDateSelectionAnnouncer(
    createAnnouncement === undefined
      ? defaultCreateAnnouncement
      : createAnnouncement,
    dateAdapter,
  );

  const setFocusedDate = useCallback(
    (event: SyntheticEvent | null, date: DateFrameworkType | null) => {
      if (focusedDateRef && event?.target instanceof HTMLElement) {
        focusedDateRef.current = event.target;
      }
      const exceededRangeLimit = date ? isOutsideAllowedDates(date) : 0;
      if (
        date &&
        ((focusedDate && dateAdapter.isSame(date, focusedDate, "day")) ||
          exceededRangeLimit !== 0)
      ) {
        if (exceededRangeLimit !== 0) {
          announce(
            exceededRangeLimit < 0
              ? "minFocusableDateExceeded"
              : "maxFocusableDateExceeded",
          );
        }
        return;
      }
      setFocusedDateState(date);
      onFocusedDateChange?.(event, date);
    },
    [
      announce,
      dateAdapter,
      focusedDate,
      focusedDateRef,
      isOutsideAllowedDates,
      onFocusedDateChange,
    ],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: isDayVisible ignored (due to dependency on visibleMonth)
  useEffect(() => {
    const shouldTransition =
      focusedDate &&
      !focusedDateProp !== undefined &&
      !isDayVisible(focusedDate) &&
      isOutsideAllowedDates(focusedDate) === 0;

    if (shouldTransition) {
      setVisibleMonth(null, dateAdapter.startOf(focusedDate, "month"));
    }
  }, [dateAdapter, focusedDateProp, isOutsideAllowedDates, focusedDate]);

  const setVisibleMonth = useCallback(
    (event: SyntheticEvent | null, newVisibleMonth: DateFrameworkType) => {
      setVisibleMonthState(newVisibleMonth);
      announce("visibleMonthChanged", {
        startVisibleMonth: newVisibleMonth,
        endVisibleMonth: dateAdapter.add(newVisibleMonth, {
          months: responsiveNumberOfVisibleMonths - 1,
        }),
      });
      onVisibleMonthChange?.(event, newVisibleMonth);
    },
    [onVisibleMonthChange],
  );

  return useMemo(
    () =>
      ({
        state: {
          hoveredDate,
          visibleMonth,
          timezone,
          multiselect,
          minDate,
          maxDate,
          numberOfVisibleMonths: responsiveNumberOfVisibleMonths,
          selectionVariant,
          hideOutOfRangeDates,
          focusedDate,
          focusableDate,
          focusedDateRef,
          selectedDate,
        },
        helpers: {
          setVisibleMonth,
          isDayUnselectable,
          isDayHighlighted,
          isDayVisible,
          isHovered,
          isHoveredStart,
          isHoveredSpan,
          isHoveredEnd,
          isOutsideAllowedDates,
          isOutsideAllowedMonths,
          isOutsideAllowedYears,
          setFocusedDate,
          setHoveredDate,
          isDaySelectable,
          isSelected,
          isSameDay,
          setSelectedDate,
          isSelectedStart,
          isSelectedSpan,
          isSelectedEnd,
        },
      }) as UseCalendarReturn,
    [
      hoveredDate,
      visibleMonth,
      timezone,
      multiselect,
      minDate,
      maxDate,
      responsiveNumberOfVisibleMonths,
      selectionVariant,
      hideOutOfRangeDates,
      focusedDate,
      focusedDateRef,
      focusableDate,
      selectedDate,
      setVisibleMonth,
      isDayUnselectable,
      isDayHighlighted,
      isDayVisible,
      isHovered,
      isHoveredStart,
      isHoveredSpan,
      isHoveredEnd,
      isOutsideAllowedDates,
      isOutsideAllowedMonths,
      isOutsideAllowedYears,
      setFocusedDate,
      setHoveredDate,
      isDaySelectable,
      isSelected,
      isSameDay,
      setSelectedDate,
      isSelectedStart,
      isSelectedSpan,
      isSelectedEnd,
    ],
  );
}
