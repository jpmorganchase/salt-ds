import {
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
  isSameMonth,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  StackLayout,
  makePrefixer,
  useControlled,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useState,
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
  CalendarWeekHeader,
  type CalendarWeekHeaderProps,
  type DateRangeSelection,
  type UseCalendarSelectionRangeProps,
  getCurrentLocale,
} from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Props for the DatePickerRangePanel component.
 * @template T - The type of the selected date range.
 */
export interface DatePickerRangePanelProps<T>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date range is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date range or null.
   */
  onSelect?: (event: SyntheticEvent, selectedDate?: T | null) => void;

  /**
   * Helper text to be displayed below the date picker.
   */
  helperText?: string;

  /**
   * The currently visible month for the start date.
   */
  startVisibleMonth?: DateValue;

  /**
   * The default visible month for the start date.
   */
  defaultStartVisibleMonth?: DateValue;

  /**
   * Callback fired when the visible month for the start date changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month for the start date.
   */
  onStartVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;

  /**
   * The currently visible month for the end date.
   */
  endVisibleMonth?: DateValue;

  /**
   * The default visible month for the end date.
   */
  defaultEndVisibleMonth?: DateValue;

  /**
   * Callback fired when the visible month for the end date changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month for the end date.
   */
  onEndVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;

  /**
   * Props to be passed to the start date CalendarNavigation component.
   */
  StartCalendarNavigationProps?: CalendarNavigationProps;

  /**
   * Props to be passed to the start date calendar component.
   */
  StartCalendarProps?: Partial<
    Omit<
      CalendarRangeProps | CalendarOffsetProps,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;
  /**
   * Props to be passed to the start date CalendarWeekHeader component.
   */
  StartCalendarWeekHeaderProps?: CalendarWeekHeaderProps;
  /**
   * Props to be passed to the start date CalendarDataGrid component.
   */
  StartCalendarDataGridProps?: CalendarGridProps;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarProps?: Partial<
    Omit<
      CalendarRangeProps,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarNavigationProps?: CalendarNavigationProps;
  /**
   * Props to be passed to the end date CalendarWeekHeader component.
   */
  EndCalendarWeekHeaderProps?: CalendarWeekHeaderProps;
  /**
   * Props to be passed to the end date CalendarDataGrid component.
   */
  EndCalendarDataGridProps?: CalendarGridProps;
}

function getFallbackVisibleMonths(
  selectedDate: DateRangeSelection | null,
  timeZone: string,
) {
  const createConsecutiveRange = (date: DateValue) => [
    startOfMonth(date),
    startOfMonth(date).add({ months: 1 }),
  ];

  if (selectedDate?.startDate) {
    const { startDate, endDate } = selectedDate;
    if (endDate) {
      return isSameMonth(startDate, endDate)
        ? createConsecutiveRange(startDate)
        : [startOfMonth(startDate), startOfMonth(endDate)];
    }
    return createConsecutiveRange(startDate);
  }

  const currentMonth = startOfMonth(today(timeZone));
  return [currentMonth, currentMonth.add({ months: 1 })];
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerRangePanel = forwardRef<
  HTMLDivElement,
  DatePickerRangePanelProps<DateRangeSelection>
>(function DatePickerRangePanel(props, ref) {
  const {
    className,
    defaultStartVisibleMonth: defaultStartVisibleMonthProp,
    startVisibleMonth: startVisibleMonthProp,
    onStartVisibleMonthChange,
    defaultEndVisibleMonth: defaultEndVisibleMonthProp,
    endVisibleMonth: endVisibleMonthProp,
    onEndVisibleMonthChange,
    helperText,
    onSelect,
    StartCalendarProps: StartCalendarPropsProp,
    StartCalendarNavigationProps,
    StartCalendarWeekHeaderProps,
    StartCalendarDataGridProps,
    EndCalendarProps: EndCalendarPropsProp,
    EndCalendarNavigationProps,
    EndCalendarWeekHeaderProps,
    EndCalendarDataGridProps,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-range-panel",
    css: datePickerPanelCss,
    window: targetWindow,
  });

  const {
    state: {
      selectedDate,
      timeZone = getLocalTimeZone(),
      minDate = startOfMonth(today(timeZone)),
      maxDate = minDate.add({ months: 1 }),
      locale = getCurrentLocale(),
    },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "range" });

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [[fallbackStartVisibleMonth, fallbackEndVisibleMonth]] = useState(() =>
    getFallbackVisibleMonths(selectedDate, timeZone),
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
    (event: SyntheticEvent, newDate: DateRangeSelection | null) => {
      setSelectedDate(newDate, { startDate: false, endDate: false });
      onSelect?.(event, newDate);
    },
    [onSelect, setSelectedDate],
  );

  const handleHoveredStartDateChange: CalendarProps["onHoveredDateChange"] =
    useCallback(
      (event: SyntheticEvent, newHoveredDate: DateValue | null) => {
        setHoveredDate(newHoveredDate);
        if (newHoveredDate && StartCalendarPropsProp?.onHoveredDateChange) {
          StartCalendarPropsProp.onHoveredDateChange?.(event, newHoveredDate);
        }
      },
      [StartCalendarPropsProp?.onHoveredDateChange],
    );
  const handleHoveredEndDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: DateValue | null) => {
      setHoveredDate(newHoveredDate);
      if (newHoveredDate && EndCalendarPropsProp?.onHoveredDateChange) {
        EndCalendarPropsProp.onHoveredDateChange(event, newHoveredDate);
      }
    },
    [EndCalendarPropsProp?.onHoveredDateChange],
  );

  const handleStartVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: DateValue) => {
      setStartVisibleMonth(newVisibleMonth);
      if (newVisibleMonth.compare(endVisibleMonth) >= 0) {
        setEndVisibleMonth(newVisibleMonth.add({ months: 1 }));
      }
      onStartVisibleMonthChange?.(event, newVisibleMonth);
    },
    [endVisibleMonth, onStartVisibleMonthChange],
  );

  const handleEndVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: DateValue) => {
      setEndVisibleMonth(newVisibleMonth);
      if (newVisibleMonth.compare(startVisibleMonth) <= 0) {
        setStartVisibleMonth(
          startOfMonth(newVisibleMonth.subtract({ months: 1 })),
        );
      }
      onEndVisibleMonthChange?.(event, newVisibleMonth);
    },
    [startVisibleMonth, onEndVisibleMonthChange],
  );

  function getHoveredDate(
    date?: DateValue | null,
    hoveredDate?: DateValue | null,
  ) {
    return date && hoveredDate && hoveredDate?.compare(endOfMonth(date)) > 0
      ? endOfMonth(date)
      : hoveredDate;
  }

  const StartCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate: getHoveredDate(selectedDate?.startDate, hoveredDate),
    selectedDate: selectedDate as DateRangeSelection,
    onHoveredDateChange: handleHoveredStartDateChange,
    onVisibleMonthChange: handleStartVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    locale,
    timeZone,
    ...StartCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps>;
  const EndCalendarProps = {
    visibleMonth: endVisibleMonth,
    hoveredDate,
    selectedDate: selectedDate as DateRangeSelection,
    onHoveredDateChange: handleHoveredEndDateChange,
    onVisibleMonthChange: handleEndVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    locale,
    timeZone,
    ...EndCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps>;

  return (
    <StackLayout
      separators
      gap={0}
      className={clsx(className, withBaseName("container"))}
      ref={ref}
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
            <CalendarWeekHeader {...StartCalendarWeekHeaderProps} />
            <CalendarGrid {...StartCalendarDataGridProps} />
          </Calendar>
          <Calendar selectionVariant={"range"} {...EndCalendarProps}>
            <CalendarNavigation {...EndCalendarNavigationProps} />
            <CalendarWeekHeader {...EndCalendarWeekHeaderProps} />
            <CalendarGrid {...EndCalendarDataGridProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
