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
} from "../calendar";
import {
  type DateFrameworkType,
  type SaltDateAdapter,
  useLocalization,
} from "../date-adapters";
import { useDatePickerContext } from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Props for the DatePickerRangePanel component.
 * @template T - The type of the selected date range.
 */
export interface DatePickerRangePanelProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date range is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date range or null.
   */
  onSelect?: (
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
  StartCalendarDataGridProps?: CalendarGridProps<TDate>;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarProps?: Partial<
    Omit<
      CalendarRangeProps<TDate>,
      | "selectedDate"
      | "defaultSelectedDate"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarNavigationProps?: CalendarNavigationProps<TDate>;
  /**
   * Props to be passed to the end date CalendarWeekHeader component.
   */
  EndCalendarWeekHeaderProps?: CalendarWeekHeaderProps;
  /**
   * Props to be passed to the end date CalendarDataGrid component.
   */
  EndCalendarDataGridProps?: CalendarGridProps<TDate>;
}

function getFallbackVisibleMonths<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  selectedDate: DateRangeSelection<TDate> | null,
) {
  function createConsecutiveRange(date: TDate) {
    const startDate = dateAdapter.startOf(date, "month");
    const endDate = dateAdapter.add(startDate, { months: 1 });
    return [startDate, endDate];
  }

  if (selectedDate?.startDate) {
    const { startDate, endDate } = selectedDate;
    if (endDate) {
      return dateAdapter.isSame(startDate, endDate, "month")
        ? createConsecutiveRange(startDate)
        : [
            dateAdapter.startOf(startDate, "month"),
            dateAdapter.startOf(endDate, "month"),
          ];
    }
    return createConsecutiveRange(startDate);
  }

  const currentMonth = dateAdapter.startOf(dateAdapter.today(), "month");
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
      minDate = dateAdapter.startOf(dateAdapter.today(), "month"),
      maxDate = dateAdapter.add(minDate, { months: 1 }),
    },
    helpers: { select },
  } = useDatePickerContext<TDate>({ selectionVariant: "range" });

  const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);

  const [[fallbackStartVisibleMonth, fallbackEndVisibleMonth]] = useState(() =>
    getFallbackVisibleMonths<TDate>(dateAdapter, selectedDate),
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
      const startDate = { date: newDate?.startDate };
      const endDate = { date: newDate?.endDate };
      select({ startDate, endDate });
      onSelect?.(event, newDate);
    },
    [select, onSelect],
  );

  const handleHoveredStartDateChange: CalendarProps<TDate>["onHoveredDateChange"] =
    useCallback(
      (event: SyntheticEvent, newHoveredDate: TDate | null) => {
        setHoveredDate(newHoveredDate);
        if (newHoveredDate && StartCalendarPropsProp?.onHoveredDateChange) {
          StartCalendarPropsProp.onHoveredDateChange?.(event, newHoveredDate);
        }
      },
      [StartCalendarPropsProp?.onHoveredDateChange],
    );
  const handleHoveredEndDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: TDate | null) => {
      setHoveredDate(newHoveredDate);
      if (newHoveredDate && EndCalendarPropsProp?.onHoveredDateChange) {
        EndCalendarPropsProp.onHoveredDateChange(event, newHoveredDate);
      }
    },
    [EndCalendarPropsProp?.onHoveredDateChange],
  );

  const handleStartVisibleMonthChange = useCallback(
    (event: SyntheticEvent, newVisibleMonth: TDate) => {
      setStartVisibleMonth(newVisibleMonth);
      if (dateAdapter.compare(newVisibleMonth, endVisibleMonth) >= 0) {
        setEndVisibleMonth(dateAdapter.add(newVisibleMonth, { months: 1 }));
      }
      onStartVisibleMonthChange?.(event, newVisibleMonth);
    },
    [endVisibleMonth, onStartVisibleMonthChange],
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
    [startVisibleMonth, onEndVisibleMonthChange],
  );

  function getHoveredDate(date?: TDate | null, hoveredDate?: TDate | null) {
    return date &&
      hoveredDate &&
      dateAdapter.compare(hoveredDate, dateAdapter.endOf(date, "month")) > 0
      ? dateAdapter.endOf(date, "month")
      : hoveredDate;
  }

  const StartCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate: getHoveredDate(selectedDate?.startDate, hoveredDate),
    selectedDate: (selectedDate as DateRangeSelection<TDate>) ?? null,
    onHoveredDateChange: handleHoveredStartDateChange,
    onVisibleMonthChange: handleStartVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    ...StartCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;
  const EndCalendarProps = {
    visibleMonth: endVisibleMonth,
    hoveredDate,
    selectedDate: (selectedDate as DateRangeSelection<TDate>) ?? null,
    onHoveredDateChange: handleHoveredEndDateChange,
    onVisibleMonthChange: handleEndVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    ...EndCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;

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
