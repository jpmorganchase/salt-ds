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
  CalendarDateGrid,
  type CalendarDateGridProps,
  CalendarNavigation,
  type CalendarNavigationProps,
  type CalendarSingleProps,
  CalendarWeekHeader,
  type CalendarWeekHeaderProps,
  getCurrentLocale,
} from "../calendar";
import { Calendar, type SingleDateSelection } from "../calendar";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Props for the DatePickerSinglePanel component.
 * @template T - The type of the selected date.
 */
export interface DatePickerSinglePanelProps<T>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date or null.
   */
  onSelect?: (event: SyntheticEvent, selectedDate?: T | null) => void;

  /**
   * Helper text to be displayed below the date picker.
   */
  helperText?: string;

  /**
   * The currently visible month.
   */
  visibleMonth?: DateValue;

  /**
   * The default visible month.
   */
  defaultVisibleMonth?: DateValue;

  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (
    event: SyntheticEvent,
    visibleMonth: DateValue,
  ) => void;

  /**
   * Props to be passed to the Calendar component.
   */
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
  /**
   * Props to be passed to the CalendarNavigation component.
   */
  CalendarNavigationProps?: CalendarNavigationProps;
  /**
   * Props to be passed to the CalendarWeekHeader component.
   */
  CalendarWeekHeaderProps?: CalendarWeekHeaderProps;
  /**
   * Props to be passed to the CalendarDataGrid component.
   */
  CalendarDataGridProps?: CalendarDateGridProps;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerSinglePanel = forwardRef<
  HTMLDivElement,
  DatePickerSinglePanelProps<SingleDateSelection>
>(function DatePickerSinglePanel(props, ref) {
  const {
    CalendarProps,
    CalendarWeekHeaderProps,
    CalendarNavigationProps,
    CalendarDataGridProps,
    className,
    defaultVisibleMonth,
    visibleMonth: visibleMonthProp,
    onVisibleMonthChange,
    helperText,
    onSelect,
    ...rest
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

  const [uncontrolledDefaultVisibleMonth] = useState(
    () => defaultVisibleMonth || startOfMonth(selectedDate || today(timeZone)),
  );
  const [visibleMonth, setVisibleMonth] = useControlled({
    controlled: visibleMonthProp,
    default: uncontrolledDefaultVisibleMonth,
    name: "DatePickerSinglePanel",
    state: "visibleMonth",
  });

  const handleSelectedDateChange = useCallback(
    (event: SyntheticEvent, newDate: SingleDateSelection | null) => {
      setSelectedDate(newDate, false);
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
          <Calendar selectionVariant="single" {...baseCalendarProps}>
            <CalendarNavigation {...CalendarNavigationProps} />
            <CalendarWeekHeader {...CalendarWeekHeaderProps} />
            <CalendarDateGrid {...CalendarDataGridProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
