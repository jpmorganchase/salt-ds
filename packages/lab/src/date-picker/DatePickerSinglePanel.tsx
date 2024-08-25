import {
  type DateValue,
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
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useState,
} from "react";
import {
  CalendarNavigation,
  type CalendarNavigationProps,
  type CalendarSingleProps,
  getCurrentLocale,
} from "../calendar";
import {
  Calendar,
  type CalendarProps,
  type SingleDateSelection,
} from "../calendar";
import datePickerPanelCss from "./DatePickerPanel.css";
import { useDatePickerContext } from "./index";

export interface DatePickerSinglePanelProps<T>
  extends ComponentPropsWithoutRef<"div"> {
  onSelect?: (event: SyntheticEvent, selectedDate?: T | null) => void;
  helperText?: string;
  visibleMonth?: DateValue;
  defaultVisibleMonth?: DateValue;
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
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
  NavigationProps?: CalendarNavigationProps;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerSinglePanel = forwardRef<
  HTMLDivElement,
  DatePickerSinglePanelProps<SingleDateSelection>
>(function DatePickerSinglePanel(props, ref) {
  const {
    CalendarProps,
    NavigationProps,
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
      timeZone = getLocalTimeZone(),
      minDate = startOfMonth(today(timeZone)),
      maxDate = minDate.add({ months: 1 }),
      locale = getCurrentLocale(),
    },
    helpers: { setSelectedDate },
  } = useDatePickerContext({ selectionVariant: "single" });

  const [hoveredDate, setHoveredDate] = useState<DateValue | null>(null);

  const [visibleMonth, setVisibleMonth] = useControlled({
    controlled: visibleMonthProp,
    default:
      defaultVisibleMonth || startOfMonth(selectedDate || today(timeZone)),
    name: "DatePickerSinglePanel",
    state: "visibleMonth",
  });

  const handleSelectedDateChange = useCallback(
    (event: SyntheticEvent, newDate: SingleDateSelection | null) => {
      setSelectedDate(newDate);
      onSelect?.(event, newDate);
    },
    [setSelectedDate, onSelect],
  );

  const handleHoveredDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: SingleDateSelection | null) => {
      setHoveredDate(newHoveredDate);
      if (newHoveredDate && CalendarProps?.onHoveredDateChange) {
        CalendarProps.onHoveredDateChange(event, newHoveredDate);
      }
    },
    [CalendarProps?.onHoveredDateChange],
  );

  const handleVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: DateValue) => {
      setVisibleMonth(newVisibleMonth);
      if (onVisibleMonthChange) {
        onVisibleMonthChange(event, newVisibleMonth);
      }
    },
    [onVisibleMonthChange],
  );

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
    locale,
    timeZone,
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
      <FlexLayout gap={0}>
        {/* Avoid Dropdowns in Calendar inheriting the FormField's state */}
        <FormFieldContext.Provider value={{} as FormFieldContextValue}>
          <Calendar selectionVariant="single" {...baseCalendarProps}>
            <CalendarNavigation {...NavigationProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
