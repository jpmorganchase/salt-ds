import {
  ComponentPropsWithoutRef,
  forwardRef,
  SyntheticEvent,
  useState,
} from "react";
import {
  DateValue,
  getLocalTimeZone,
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
import { CalendarSingleProps } from "@salt-ds/lab";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Calendar, CalendarProps, SingleSelectionValueType } from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

export interface DatePickerSinglePanelProps<SelectionVariantType>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (
    event: SyntheticEvent,
    selectedDate?: SelectionVariantType | null
  ) => void;
  helperText?: string;
  visibleMonth?: DateValue;
  defaultVisibleMonth?: DateValue;
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue
  ) => void;
  CalendarProps?: Partial<
    Omit<
      CalendarSingleProps,
      | "selectionVariant"
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectedDateChange"
      | "onVisibleMonthChange"
    >
  >;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerSinglePanel = forwardRef<
  HTMLDivElement,
  DatePickerSinglePanelProps<SingleSelectionValueType>
>(function DatePickerSinglePanel(props, ref) {
  const {
    CalendarProps,
    className,
    defaultVisibleMonth,
    visibleMonth: visibleMonthProp,
    onVisibleMonthChange,
    helperText,
    onSelect,
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-single-panel",
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
  } = useDatePickerContext<SingleSelectionValueType>();

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [visibleMonth, setVisibleMonth] = useControlled({
    controlled: visibleMonthProp,
    default: defaultVisibleMonth || startOfMonth(selectedDate || minDate),
    name: "DatePickerSinglePanel",
    state: "visibleMonth",
  });

  const handleSelectedDateChange = (
    event: SyntheticEvent,
    newDate: SingleSelectionValueType | null
  ) => {
    setSelectedDate(newDate);
    onSelect?.(event, newDate);
  };

  const handleHoveredDateChange: CalendarProps["onHoveredDateChange"] = (
    event,
    newHoveredDate
  ) => {
    setHoveredDate(newHoveredDate);
    if (newHoveredDate && CalendarProps?.onHoveredDateChange) {
      CalendarProps.onHoveredDateChange(event, newHoveredDate);
    }
  };

  const handleVisibleMonthChange: CalendarProps["onVisibleMonthChange"] = (
    event,
    newVisibleMonth
  ) => {
    setVisibleMonth(newVisibleMonth);
    if (onVisibleMonthChange) {
      onVisibleMonthChange(event, newVisibleMonth);
    }
  };

  const baseCalendarProps: Partial<CalendarSingleProps> = {
    selectionVariant: "single",
    visibleMonth,
    hoveredDate,
    onHoveredDateChange: handleHoveredDateChange,
    onVisibleMonthChange: handleVisibleMonthChange,
    onSelectedDateChange: handleSelectedDateChange,
    hideOutOfRangeDates: true,
    selectedDate,
    minDate,
    maxDate,
    ...CalendarProps,
  };

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
      <FlexLayout>
        {/* Avoid Dropdowns in Calendar inheriting the FormField's state */}
        <FormFieldContext.Provider value={{} as FormFieldContextValue}>
          <Calendar selectionVariant="single" {...baseCalendarProps} />,
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
