import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useState,
} from "react";
import clsx from "clsx";
import {
  type DateValue,
  endOfMonth,
  getLocalTimeZone,
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
import {
  Calendar,
  type CalendarOffsetProps,
  type CalendarProps,
  type CalendarRangeProps,
  type DateRangeSelection,
  type UseCalendarSelectionRangeProps,
} from "../calendar";
import {
  useDatePickerContext,
} from "./DatePickerContext";
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
    },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "range" });

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [startVisibleMonth, setStartVisibleMonth] = useControlled({
    controlled: startVisibleMonthProp,
    default:
      defaultStartVisibleMonthProp ||
      startOfMonth(selectedDate?.startDate || minDate),
    name: "DatePickerRangePanel",
    state: "startVisibleMonth",
  });
  const isStartVisibleMonthControlled = !!startVisibleMonthProp;
  const [endVisibleMonth, setEndVisibleMonth] = useControlled({
    controlled: endVisibleMonthProp,
    default: defaultEndVisibleMonthProp || startOfMonth(maxDate),
    name: "DatePickerRangePanel",
    state: "endVisibleMonth",
  });
  const isEndVisibleMonthControlled = !!endVisibleMonthProp;

  const handleSelectedDateChange: UseCalendarSelectionRangeProps["onSelectedDateChange"] =
    (event, newDate) => {
      setSelectedDate(newDate);
      onSelect?.(event, newDate);
    };

  const handleHoveredStartDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
    if (newHoveredDate && StartCalendarProps?.onHoveredDateChange) {
      StartCalendarProps.onHoveredDateChange?.(event, newHoveredDate);
    }
  };
  const handleHoveredEndDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate,
  ) => {
    setHoveredDate(newHoveredDate);
    if (newHoveredDate && EndCalendarProps?.onHoveredDateChange) {
      EndCalendarProps.onHoveredDateChange(event, newHoveredDate);
    }
  };

  const handleStartVisibleMonthChange: CalendarProps["onVisibleMonthChange"] = (
    event,
    newVisibleMonth,
  ) => {
    setStartVisibleMonth(newVisibleMonth);
    if (
      !isStartVisibleMonthControlled &&
      newVisibleMonth.compare(endVisibleMonth) >= 0
    ) {
      setEndVisibleMonth(newVisibleMonth.add({ months: 1 }));
    }
    onStartVisibleMonthChange?.(event, newVisibleMonth);
  };

  const handleEndVisibleMonthChange: CalendarProps["onVisibleMonthChange"] = (
    event,
    newVisibleMonth,
  ) => {
    setEndVisibleMonth(newVisibleMonth);
    if (
      !isEndVisibleMonthControlled &&
      newVisibleMonth.compare(startVisibleMonth) <= 0
    ) {
      setStartVisibleMonth(
        startOfMonth(newVisibleMonth.subtract({ months: 1 })),
      );
    }
    onEndVisibleMonthChange?.(event, newVisibleMonth);
  };

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
          <Calendar selectionVariant={"range"} {...startDateCalendarProps} />,
          <Calendar selectionVariant={"range"} {...endDateCalendarProps} />,
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
