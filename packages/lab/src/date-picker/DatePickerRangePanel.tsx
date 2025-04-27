import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  StackLayout,
  makePrefixer,
  useControlled,
  useForkRef,
} from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
  Timezone,
} from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
  FocusEventHandler,
} from "react";
import {
  Calendar,
  CalendarGrid,
  type CalendarGridProps,
  CalendarNavigation,
  type CalendarNavigationProps,
  type CalendarOffsetProps,
  type CalendarProps,
  type CalendarRangeProps,
  type DateRangeSelection,
  type UseCalendarSelectionRangeProps,
} from "../calendar";
import { useLocalization } from "../localization-provider";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";
import { generateDatesForMonth } from "../calendar/internal/utils";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";

/**
 * Props for the DatePickerRangePanel component.
 * @template TDate - The type of the date object.
 */
export interface DatePickerRangePanelProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date range is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date range or null.
   */
  onSelectionChange?: (
    event: SyntheticEvent,
    selectedDate?: DateRangeSelection<TDate> | null,
  ) => void;

  /**
   * Helper text to be displayed below the date picker.
   */
  helperText?: string;

  /**
   * The currently visible month for the start date.
   */
  startVisibleMonth?: TDate;

  /**
   * The default visible month for the start date.
   */
  defaultStartVisibleMonth?: TDate;

  /**
   * Callback fired when the visible month for the start date changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month for the start date.
   */
  onStartVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: TDate,
  ) => void;

  /**
   * The currently visible month for the end date.
   */
  endVisibleMonth?: TDate;

  /**
   * The default visible month for the end date.
   */
  defaultEndVisibleMonth?: TDate;

  /**
   * Callback fired when the visible month for the end date changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month for the end date.
   */
  onEndVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: TDate,
  ) => void;

  /**
   * Callback fired when the focused date changes.
   * @param event - The synthetic event or undefined if called by effect
   * @param hoveredDate - The new hovered date.
   */
  onFocusedDateChange?: (
    event: SyntheticEvent | undefined,
    hoveredDate?: TDate | null,
  ) => void;
  /**
   * Callback fired when the hovered date changes.
   * @param event - The synthetic event.
   * @param hoveredDate - The new hovered date.
   */
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate?: TDate | null,
  ) => void;

  /**
   * Props to be passed to the start date CalendarNavigation component.
   */
  StartCalendarNavigationProps?: CalendarNavigationProps<TDate>;

  /**
   * Props to be passed to the start date calendar component.
   */
  StartCalendarProps?: Partial<
    Omit<
      CalendarRangeProps<TDate> | CalendarOffsetProps<TDate>,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onFocusedDateChange"
      | "onHoveredDateChange"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;
  /**
   * Props to be passed to the start date CalendarGrid component.
   */
  StartCalendarGridProps?: CalendarGridProps<TDate>;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarProps?: Partial<
    Omit<
      CalendarRangeProps<TDate>,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onFocusedDateChange"
      | "onHoveredDateChange"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarNavigationProps?: CalendarNavigationProps<TDate>;
  /**
   * Props to be passed to the end date CalendarGrid component.
   */
  EndCalendarGridProps?: CalendarGridProps<TDate>;
}

function getFallbackVisibleMonths<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  selectedDate: DateRangeSelection<TDate> | null,
  timezone: Timezone = "default",
) {
  function createConsecutiveRange(date: TDate) {
    const startDate = dateAdapter.startOf(date, "month");
    const endDate = dateAdapter.add(startDate, { months: 1 });
    return [startDate, endDate];
  }

  if (selectedDate && dateAdapter.isValid(selectedDate?.startDate)) {
    const { startDate, endDate } = selectedDate;
    if (dateAdapter.isValid(endDate)) {
      return dateAdapter.isSame(startDate, endDate, "month")
        ? createConsecutiveRange(startDate)
        : [
            dateAdapter.startOf(startDate, "month"),
            dateAdapter.startOf(endDate, "month"),
          ];
    }
    return createConsecutiveRange(startDate);
  }

  const currentMonth = dateAdapter.startOf(
    dateAdapter.today(timezone),
    "month",
  );
  return [currentMonth, dateAdapter.add(currentMonth, { months: 1 })];
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerRangePanel = forwardRef(function DatePickerRangePanel<
  TDate extends DateFrameworkType,
>(props: DatePickerRangePanelProps<TDate>, ref: React.Ref<HTMLDivElement>) {
  const { dateAdapter } = useLocalization<TDate>();

  const {
    className,
    defaultStartVisibleMonth: defaultStartVisibleMonthProp,
    startVisibleMonth: startVisibleMonthProp,
    onStartVisibleMonthChange,
    defaultEndVisibleMonth: defaultEndVisibleMonthProp,
    endVisibleMonth: endVisibleMonthProp,
    onEndVisibleMonthChange,
    helperText,
    onFocusedDateChange,
    onHoveredDateChange,
    onSelectionChange,
    StartCalendarProps: StartCalendarPropsProp,
    StartCalendarNavigationProps,
    StartCalendarGridProps,
    EndCalendarProps: EndCalendarPropsProp,
    EndCalendarNavigationProps,
    EndCalendarGridProps,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-range-panel",
    css: datePickerPanelCss,
    window: targetWindow,
  });

  const calendarsRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, calendarsRef);

  const {
    state: {
      timezone,
      selectedDate,
      minDate = dateAdapter.startOf(dateAdapter.today(timezone), "month"),
      maxDate = dateAdapter.add(minDate, { months: 1 }),
    },
    helpers: { select, isDayDisabled, isDayHighlighted, isDayUnselectable },
  } = useDatePickerContext<TDate>({ selectionVariant: "range" });

  const {
    state: { initialFocusRef, focused },
  } = useDatePickerOverlay();

  const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);

  const [[fallbackStartVisibleMonth, fallbackEndVisibleMonth]] = useState(() =>
    getFallbackVisibleMonths<TDate>(dateAdapter, selectedDate, timezone),
  );

  const [startVisibleMonth, setStartVisibleMonth] = useControlled({
    controlled: startVisibleMonthProp,
    default: defaultStartVisibleMonthProp || fallbackStartVisibleMonth,
    name: "DatePickerRangePanel",
    state: "startVisibleMonth",
  });

  const [endVisibleMonth, setEndVisibleMonth] = useControlled({
    controlled: endVisibleMonthProp,
    default: defaultEndVisibleMonthProp || fallbackEndVisibleMonth,
    name: "DatePickerRangePanel",
    state: "endVisibleMonth",
  });

  const handleSelectionChange = useCallback(
    (event: SyntheticEvent, newDate: DateRangeSelection<TDate> | null) => {
      select(event, newDate);
      onSelectionChange?.(event, newDate);
    },
    [select, onSelectionChange],
  );

  const handleHoveredStartDateChange: CalendarProps<TDate>["onHoveredDateChange"] =
    useCallback(
      (event: SyntheticEvent, newHoveredDate: TDate | null) => {
        setHoveredDate(newHoveredDate);
        onHoveredDateChange?.(event, newHoveredDate);
      },
      [onHoveredDateChange],
    );

  const handleHoveredEndDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: TDate | null) => {
      setHoveredDate(newHoveredDate);
      onHoveredDateChange?.(event, newHoveredDate);
    },
    [onHoveredDateChange],
  );

  const handleStartVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: TDate) => {
      setStartVisibleMonth(newVisibleMonth);
      if (dateAdapter.compare(newVisibleMonth, endVisibleMonth) >= 0) {
        setEndVisibleMonth(dateAdapter.add(newVisibleMonth, { months: 1 }));
      }
      onStartVisibleMonthChange?.(event, newVisibleMonth);
    },
    [dateAdapter, endVisibleMonth, onStartVisibleMonthChange],
  );

  const handleEndVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: TDate) => {
      setEndVisibleMonth(newVisibleMonth);
      if (dateAdapter.compare(newVisibleMonth, startVisibleMonth) <= 0) {
        setStartVisibleMonth(
          dateAdapter.startOf(
            dateAdapter.subtract(newVisibleMonth, { months: 1 }),
            "month",
          ),
        );
      }
      onEndVisibleMonthChange?.(event, newVisibleMonth);
    },
    [dateAdapter, startVisibleMonth, onEndVisibleMonthChange],
  );

  const calendarSelectedDate = {
    startDate:
      selectedDate && dateAdapter.isValid(selectedDate.startDate)
        ? selectedDate.startDate
        : null,
    endDate:
      selectedDate && dateAdapter.isValid(selectedDate.endDate)
        ? selectedDate.endDate
        : null,
  };

  const [focusedDate, setFocusedDate] = useState<TDate | null>(null);

  const getNextFocusedDate = () => {
    const getVisibleSelectedDate = (visibleMonth: TDate) => {
      if (
        selectedDate?.startDate &&
        dateAdapter.isSame(visibleMonth, selectedDate.startDate, "month")
      ) {
        return selectedDate.startDate;
      }
      if (
        selectedDate?.endDate &&
        dateAdapter.isSame(visibleMonth, selectedDate.endDate, "month")
      ) {
        return selectedDate.endDate;
      }
      return null;
    };
    let focusSelectedDate = getVisibleSelectedDate(startVisibleMonth);
    focusSelectedDate =
      focusSelectedDate ?? getVisibleSelectedDate(endVisibleMonth);
    if (focusSelectedDate) {
      return focusSelectedDate;
    }
    // Today
    const today = dateAdapter.today(timezone);
    if (
      dateAdapter.isSame(startVisibleMonth, today, "month") ||
      dateAdapter.isSame(endVisibleMonth, today, "month")
    ) {
      return today;
    }
    // First selectable date in either calendar
    const getFirstSelectableDate = (visibleMonth: TDate) => {
      const isOutsideAllowedDates = (date: TDate) => {
        return (
          dateAdapter.compare(date, minDate) < 0 ||
          dateAdapter.compare(date, maxDate) > 0
        );
      };
      const isDaySelectable = (date: TDate) =>
        !(
          date &&
          (isDayUnselectable?.(date) ||
            isDayDisabled?.(date) ||
            isOutsideAllowedDates(date))
        );
      const firstSelectableDate = generateDatesForMonth(
        dateAdapter,
        visibleMonth,
      ).find((visibleDay) => isDaySelectable(visibleDay));
      return firstSelectableDate ?? null;
    };
    return (
      getFirstSelectableDate(startVisibleMonth) ??
      getFirstSelectableDate(endVisibleMonth)
    );
  };

  const handleStartCalendarFocusedDateChange = useCallback(
    (event: SyntheticEvent | undefined, newFocusedDate: TDate) => {

      setFocusedDate(newFocusedDate);
      if (
        newFocusedDate &&
        !dateAdapter.isSame(startVisibleMonth, newFocusedDate, "month")
      ) {
        handleStartVisibleMonthChange(
          event!!,
          dateAdapter.startOf(newFocusedDate, "month"),
        );
      }
      onFocusedDateChange?.(event, newFocusedDate);
    },
    [startVisibleMonth, onFocusedDateChange],
  );

  const handleEndCalendarFocusedDateChange = useCallback(
    (event: SyntheticEvent | undefined, newFocusedDate: TDate) => {
      setFocusedDate(newFocusedDate);
      if (
        newFocusedDate &&
        !dateAdapter.isSame(endVisibleMonth, newFocusedDate, "month")
      ) {
        handleEndVisibleMonthChange(
          event!!,
          dateAdapter.startOf(newFocusedDate, "month"),
        );
      }
      onFocusedDateChange?.(event, newFocusedDate);
    },
    [endVisibleMonth, onFocusedDateChange],
  );

  const handleContainerBlur: FocusEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      setTimeout(() => {
        if (!calendarsRef?.current?.contains(document.activeElement)) {
          setHoveredDate(null);
          //setFocusedDate(getNextFocusedDate());
        }
      }, 0);
      rest?.onBlur?.(event);
    },
    [startVisibleMonth, endVisibleMonth, selectedDate, rest?.onBlur],
  );

  useLayoutEffect(() => {
    const nextFocusedDate = getNextFocusedDate();
    setFocusedDate(nextFocusedDate);
  }, [selectedDate]);

  const isStartCalendarFocused =
    focused &&
    focusedDate &&
    dateAdapter.isSame(startVisibleMonth, focusedDate, "month");
  const isEndCalendarFocused =
    !isStartCalendarFocused &&
    focused &&
    focusedDate &&
    dateAdapter.isSame(endVisibleMonth, focusedDate, "month");

  const StartCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate,
    selectedDate: calendarSelectedDate,
    isDayDisabled,
    isDayHighlighted,
    isDayUnselectable,
    focusedDateRef: isStartCalendarFocused ? initialFocusRef : null,
    focusedDate: isStartCalendarFocused ? focusedDate : null,
    onHoveredDateChange: handleHoveredStartDateChange,
    onFocusedDateChange: handleStartCalendarFocusedDateChange,
    onVisibleMonthChange: handleStartVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    timezone,
    ...StartCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;
  const EndCalendarProps = {
    visibleMonth: endVisibleMonth,
    hoveredDate,
    isDayDisabled,
    isDayHighlighted,
    isDayUnselectable,
    focusedDateRef: isEndCalendarFocused ? initialFocusRef : null,
    focusedDate: isEndCalendarFocused ? focusedDate : null,
    selectedDate: calendarSelectedDate,
    onFocusedDateChange: handleEndCalendarFocusedDateChange,
    onHoveredDateChange: handleHoveredEndDateChange,
    onVisibleMonthChange: handleEndVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    timezone,
    ...EndCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;

  return (
    <StackLayout
      separators
      gap={0}
      className={clsx(className, withBaseName("container"))}
      onBlur={handleContainerBlur}
      ref={containerRef}
      {...rest}
    >
      {helperText && (
        <FlexItem className={withBaseName("header")}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout gap={0}>
        {/* Avoid Dropdowns in Calendar inheriting the FormField's state */}
        <FormFieldContext.Provider value={{} as FormFieldContextValue}>
          <Calendar selectionVariant={"range"} {...StartCalendarProps}>
            <CalendarNavigation {...StartCalendarNavigationProps} />
            <CalendarGrid {...StartCalendarGridProps} />
          </Calendar>
          <Calendar selectionVariant={"range"} {...EndCalendarProps}>
            <CalendarNavigation {...EndCalendarNavigationProps} />
            <CalendarGrid {...EndCalendarGridProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
