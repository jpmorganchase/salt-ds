import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  StackLayout,
  makePrefixer,
  resolveResponsiveValue,
  useBreakpoint,
  useControlled,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type SyntheticEvent, forwardRef, useCallback, useState } from "react";
import {
  CalendarGrid,
  CalendarNavigation,
  type CalendarRangeProps,
} from "../calendar";
import { Calendar, type DateRangeSelection } from "../calendar";
import { useLocalization } from "../localization-provider";
import {
  type RangeDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";
import type { DatePickerPanelBaseProps } from "./DatePickerSingleGridPanel";

const withBaseName = makePrefixer("saltDatePickerPanel");

/**
 * Props for the DatePickerRangeGridPanel component.
 * @template TDate - The type of the date object.
 */
export type DatePickerRangeGridPanelProps<TDate extends DateFrameworkType> =
  DatePickerPanelBaseProps<TDate> &
    DateRangeSelection<TDate> & {
      onSelectionChange?: (
        event: SyntheticEvent,
        selectedDate?: DateRangeSelection<TDate> | null,
      ) => void;
      CalendarProps?: Partial<
        Omit<
          CalendarRangeProps<TDate>,
          | "selectionVariant"
          | "selectedDate"
          | "defaultSelectedDate"
          | "onSelectionChange"
          | "onVisibleMonthChange"
        >
      >;
    };

export const DatePickerRangeGridPanel = forwardRef(
  function DatePickerRangeGridPanel<TDate extends DateFrameworkType>(
    props: DatePickerRangeGridPanelProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) {
    const { dateAdapter } = useLocalization<TDate>();

    const {
      CalendarProps,
      CalendarNavigationProps,
      CalendarGridProps,
      className,
      defaultVisibleMonth,
      visibleMonth: visibleMonthProp,
      onVisibleMonthChange,
      helperText,
      onSelectionChange,
      numberOfVisibleMonths = 2,
      columns = numberOfVisibleMonths,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-picker-range-grid-panel",
      css: datePickerPanelCss,
      window: targetWindow,
    });

    const stateAndHelpers: RangeDatePickerState<TDate> = useDatePickerContext({
      selectionVariant: "range",
    });

    const {
      state: {
        selectedDate = null,
        minDate = dateAdapter.startOf(dateAdapter.today(), "month"),
        maxDate = dateAdapter.add(minDate, { months: 1 }),
      },
      helpers: { select, isDayDisabled, isDayHighlighted, isDayUnselectable },
    } = stateAndHelpers;

    const { matchedBreakpoints } = useBreakpoint();

    const responsiveColumns =
      resolveResponsiveValue(columns, matchedBreakpoints) ?? 1;
    const responsiveNumberOfVisibleMonths =
      resolveResponsiveValue(numberOfVisibleMonths, matchedBreakpoints) ?? 1;
    const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);

    const [uncontrolledDefaultVisibleMonth] = useState(() => {
      const validDate: TDate =
        selectedDate?.startDate && dateAdapter.isValid(selectedDate.startDate)
          ? selectedDate.startDate
          : dateAdapter.today();

      // Ensure that defaultVisibleMonth is used if provided, otherwise use the start of the valid date
      return defaultVisibleMonth || dateAdapter.startOf(validDate, "month");
    });

    const [visibleMonth, setVisibleMonth] = useControlled({
      controlled: visibleMonthProp,
      default: uncontrolledDefaultVisibleMonth,
      name: "DatePickerRangeGridPanel",
      state: "visibleMonth",
    });

    const handleSelectionChange = useCallback(
      (
        event: SyntheticEvent,
        newDate: TDate | DateRangeSelection<TDate> | null,
      ) => {
        const dateRange = newDate as DateRangeSelection<TDate> | null;
        select(event, dateRange);
        onSelectionChange?.(event, dateRange);
      },
      [onSelectionChange, select],
    );

    const handleHoveredDateChange = useCallback(
      (event: SyntheticEvent, newHoveredDate: TDate | null) => {
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

    const calendarProps = {
      visibleMonth,
      hoveredDate,
      onHoveredDateChange: handleHoveredDateChange,
      onVisibleMonthChange: handleVisibleMonthChange,
      onSelectionChange: handleSelectionChange,
      hideOutOfRangeDates: true,
      isDayDisabled,
      isDayHighlighted,
      isDayUnselectable,
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
          <FormFieldContext.Provider value={{} as FormFieldContextValue}>
            <Calendar
              selectionVariant={"range"}
              numberOfVisibleMonths={responsiveNumberOfVisibleMonths}
              {...(calendarProps as Partial<CalendarRangeProps<TDate>>)}
            >
              <CalendarNavigation {...CalendarNavigationProps} />
              <CalendarGrid
                columns={responsiveColumns}
                {...CalendarGridProps}
              />
            </Calendar>
          </FormFieldContext.Provider>
        </FlexLayout>
      </StackLayout>
    );
  },
);
