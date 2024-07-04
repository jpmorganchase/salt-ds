import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useState,
} from "react";
import {
  DateValue,
  getLocalTimeZone,
  endOfMonth,
  startOfMonth,
  today,
} from "@internationalized/date";
import clsx from "clsx";
import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
  useControlled,
} from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import {
  Calendar,
  CalendarOffsetProps,
  CalendarProps,
  CalendarRangeProps,
  RangeSelectionValueType,
  UseCalendarSelectionRangeProps,
} from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

export interface DatePickerRangePanelProps<SelectionVariantType>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType | null
  ) => void;
  helperText?: string;
  startVisibleMonth?: DateValue;
  defaultStartVisibleMonth?: DateValue;
  onStartVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue
  ) => void;
  endVisibleMonth?: DateValue;
  defaultEndVisibleMonth?: DateValue;
  onEndVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue
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
  DatePickerRangePanelProps<RangeSelectionValueType>
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
  } = useDatePickerContext<RangeSelectionValueType>();

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [startVisibleMonth, setStartVisibleMonth] = useControlled({
    controlled: startVisibleMonthProp,
    default: defaultStartVisibleMonthProp || startOfMonth(selectedDate?.startDate || minDate),
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
    newHoveredDate
  ) => {
    setHoveredDate(newHoveredDate);
    if (newHoveredDate && StartCalendarProps?.onHoveredDateChange) {
      StartCalendarProps.onHoveredDateChange?.(event, newHoveredDate);
    }
  };
  const handleHoveredEndDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate
  ) => {
    setHoveredDate(newHoveredDate);
    if (newHoveredDate && EndCalendarProps?.onHoveredDateChange) {
      EndCalendarProps.onHoveredDateChange(event, newHoveredDate);
    }
  };

  const handleStartVisibleMonthChange: CalendarProps["onVisibleMonthChange"] = (
    event,
    newVisibleMonth
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
    newVisibleMonth
  ) => {
    setEndVisibleMonth(newVisibleMonth);
    if (
      !isEndVisibleMonthControlled &&
      newVisibleMonth.compare(startVisibleMonth) <= 0
    ) {
      setStartVisibleMonth(
        startOfMonth(newVisibleMonth.subtract({ months: 1 }))
      );
    }
    onEndVisibleMonthChange?.(event, newVisibleMonth);
  };

  function getHoveredDate(
    date?: DateValue | null,
    hoveredDate?: DateValue | null
  ) {
    return date && hoveredDate && hoveredDate?.compare(endOfMonth(date)) > 0
      ? endOfMonth(date)
      : hoveredDate;
  }

  const startDateCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate: getHoveredDate(selectedDate?.startDate, hoveredDate),
    selectedDate: selectedDate as RangeSelectionValueType,
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
    selectedDate: selectedDate as RangeSelectionValueType,
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
