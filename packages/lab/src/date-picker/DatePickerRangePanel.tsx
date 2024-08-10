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
  CalendarNavigation,
  type CalendarOffsetProps,
  type CalendarProps,
  type CalendarRangeProps,
  type DateRangeSelection,
  type UseCalendarSelectionRangeProps,
  getCurrentLocale,
} from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

export interface DatePickerRangePanelProps<T>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (event: SyntheticEvent, selectedDate?: T | null) => void;
  helperText?: string;
  startVisibleMonth?: DateValue;
  defaultStartVisibleMonth?: DateValue;
  onStartVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;
  endVisibleMonth?: DateValue;
  defaultEndVisibleMonth?: DateValue;
  onEndVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;
  StartCalendarProps?: Partial<
    Omit<
      CalendarRangeProps | CalendarOffsetProps,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectedDateChange"
      | "onVisibleMonthChange"
    >
  >;
  EndCalendarProps?: Partial<
    Omit<
      CalendarRangeProps,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectedDateChange"
      | "onVisibleMonthChange"
    >
  >;
}

function getFallbackVisibleMonths(selectedDate?: DateRangeSelection | null) {
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

  const todayDate = today(getLocalTimeZone());
  return [todayDate, todayDate.add({ months: 1 })];
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
    StartCalendarProps,
    EndCalendarProps,
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
      minDate = startOfMonth(today(getLocalTimeZone())),
      maxDate = minDate.add({ months: 1 }),
      locale = getCurrentLocale(),
      timeZone = getLocalTimeZone(),
    },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "range" });

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [[fallbackStartVisibleMonth, fallbackEndVisibleMonth]] = useState(() =>
    getFallbackVisibleMonths(selectedDate),
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

  const handleSelectedDateChange = useCallback(
    (event: SyntheticEvent, newDate: DateRangeSelection | null) => {
      setSelectedDate(newDate);
      onSelect?.(event, newDate);
    },
    [onSelect, setSelectedDate],
  );

  const handleHoveredStartDateChange: CalendarProps["onHoveredDateChange"] =
    useCallback(
      (event: SyntheticEvent, newHoveredDate: DateValue | null) => {
        setHoveredDate(newHoveredDate);
        if (newHoveredDate && StartCalendarProps?.onHoveredDateChange) {
          StartCalendarProps.onHoveredDateChange?.(event, newHoveredDate);
        }
      },
      [setHoveredDate, StartCalendarProps?.onHoveredDateChange],
    );
  const handleHoveredEndDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: DateValue | null) => {
      setHoveredDate(newHoveredDate);
      if (newHoveredDate && EndCalendarProps?.onHoveredDateChange) {
        EndCalendarProps.onHoveredDateChange(event, newHoveredDate);
      }
    },
    [setHoveredDate, EndCalendarProps?.onHoveredDateChange],
  );

  const handleStartVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: DateValue) => {
      setStartVisibleMonth(newVisibleMonth);
      if (newVisibleMonth.compare(endVisibleMonth) >= 0) {
        setEndVisibleMonth(newVisibleMonth.add({ months: 1 }));
      }
      onStartVisibleMonthChange?.(event, newVisibleMonth);
    },
    [onStartVisibleMonthChange, setStartVisibleMonth, setEndVisibleMonth],
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
    [onEndVisibleMonthChange, setStartVisibleMonth, setEndVisibleMonth],
  );

  function getHoveredDate(
    date?: DateValue | null,
    hoveredDate?: DateValue | null,
  ) {
    return date && hoveredDate && hoveredDate?.compare(endOfMonth(date)) > 0
      ? endOfMonth(date)
      : hoveredDate;
  }

  const startDateCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate: getHoveredDate(selectedDate?.startDate, hoveredDate),
    selectedDate: selectedDate as DateRangeSelection,
    onHoveredDateChange: handleHoveredStartDateChange,
    onVisibleMonthChange: handleStartVisibleMonthChange,
    onSelectedDateChange: handleSelectedDateChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    locale,
    timeZone,
    ...StartCalendarProps,
  } as Partial<UseCalendarSelectionRangeProps>;
  const endDateCalendarProps = {
    visibleMonth: endVisibleMonth,
    hoveredDate,
    selectedDate: selectedDate as DateRangeSelection,
    onHoveredDateChange: handleHoveredEndDateChange,
    onVisibleMonthChange: handleEndVisibleMonthChange,
    onSelectedDateChange: handleSelectedDateChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    locale,
    timeZone,
    ...EndCalendarProps,
  } as Partial<UseCalendarSelectionRangeProps>;

  return (
    <StackLayout
      separators
      gap={0}
      className={clsx(className, withBaseName("container"))}
      ref={ref}
    >
      {helperText && (
        <FlexItem className={withBaseName("header")}>
          <FormFieldHelperText>{helperText}</FormFieldHelperText>
        </FlexItem>
      )}
      <FlexLayout gap={0}>
        {/* Avoid Dropdowns in Calendar inheriting the FormField's state */}
        <FormFieldContext.Provider value={{} as FormFieldContextValue}>
          <Calendar selectionVariant={"range"} {...startDateCalendarProps}>
            <CalendarNavigation />
          </Calendar>
          <Calendar selectionVariant={"range"} {...endDateCalendarProps}>
            <CalendarNavigation />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
