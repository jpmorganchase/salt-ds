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
  CalendarGrid,
  type CalendarGridProps,
  CalendarNavigation,
  type CalendarNavigationProps,
  type CalendarSingleProps,
  CalendarWeekHeader,
  type CalendarWeekHeaderProps,
} from "../calendar";
import { Calendar, type SingleDateSelection } from "../calendar";
import { type DateFrameworkType, useLocalization } from "../date-adapters";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Props for the DatePickerSinglePanel component.
 * @template T - The type of the selected date.
 */
export interface DatePickerSinglePanelProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date or null.
   */
  onSelectionChange?: (event: SyntheticEvent, selectedDate?: TDate | null) => void;

  /**
   * Helper text to be displayed below the date picker.
   */
  helperText?: string;

  /**
   * The currently visible month.
   */
  visibleMonth?: TDate;

  /**
   * The default visible month.
   */
  defaultVisibleMonth?: TDate;

  /**
   * Callback fired when the visible month changes.
   * @param event - The synthetic event.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (event: SyntheticEvent, visibleMonth: TDate) => void;

  /**
   * Props to be passed to the Calendar component.
   */
  CalendarProps?: Partial<
    Omit<
      CalendarSingleProps<TDate>,
      | "selectionVariant"
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;
  /**
   * Props to be passed to the CalendarNavigation component.
   */
  CalendarNavigationProps?: CalendarNavigationProps<TDate>;
  /**
   * Props to be passed to the CalendarWeekHeader component.
   */
  CalendarWeekHeaderProps?: CalendarWeekHeaderProps;
  /**
   * Props to be passed to the CalendarDataGrid component.
   */
  CalendarDataGridProps?: CalendarGridProps<TDate>;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export const DatePickerSinglePanel = forwardRef(function DatePickerSinglePanel<
  TDate extends DateFrameworkType,
>(
  props: DatePickerSinglePanelProps<SingleDateSelection<TDate>>,
  ref: React.Ref<HTMLDivElement>,
) {
  const { dateAdapter } = useLocalization<TDate>();

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
    onSelectionChange,
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
      minDate = dateAdapter.startOf(dateAdapter.today(), "month"),
      maxDate = dateAdapter.add(minDate, { months: 1 }),
    },
    helpers: { select },
  } = useDatePickerContext<TDate>({ selectionVariant: "single" });

  const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);

  const [uncontrolledDefaultVisibleMonth] = useState(
    () => {
      const validDate = dateAdapter.isValid(selectedDate) ? selectedDate : dateAdapter.today();
      return defaultVisibleMonth || dateAdapter.startOf(validDate, "month")
    }
  );
  const [visibleMonth, setVisibleMonth] = useControlled({
    controlled: visibleMonthProp,
    default: uncontrolledDefaultVisibleMonth,
    name: "DatePickerSinglePanel",
    state: "visibleMonth",
  });

  const handleSelectionChange = useCallback(
    (event: SyntheticEvent, newDate: SingleDateSelection<TDate> | null) => {
      select(event, newDate);
      onSelectionChange?.(event, newDate);
    },
    [select, onSelectionChange],
  );

  const handleHoveredDateChange = useCallback(
    (
      event: SyntheticEvent,
      newHoveredDate: SingleDateSelection<TDate> | null,
    ) => {
      setHoveredDate(newHoveredDate);
      if (newHoveredDate && CalendarProps?.onHoveredDateChange) {
        CalendarProps.onHoveredDateChange(event, newHoveredDate);
      }
    },
    [CalendarProps?.onHoveredDateChange],
  );

  const handleVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: TDate) => {
      setVisibleMonth(newVisibleMonth);
      if (onVisibleMonthChange) {
        onVisibleMonthChange(event, newVisibleMonth);
      }
    },
    [onVisibleMonthChange],
  );

  const baseCalendarProps: Partial<CalendarSingleProps<TDate>> = {
    selectionVariant: "single",
    visibleMonth,
    hoveredDate,
    onHoveredDateChange: handleHoveredDateChange,
    onVisibleMonthChange: handleVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
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
            <CalendarGrid {...CalendarDataGridProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
