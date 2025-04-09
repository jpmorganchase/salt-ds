import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  type ResponsiveProp,
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
} from "../calendar";
import {
  Calendar,
  type DateRangeSelection,
  type SingleDateSelection,
} from "../calendar";
import { useLocalization } from "../localization-provider";
import {
  type SingleDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Base props for the DatePickerPanel grid components.
 * @template TDate - The type of the date object.
 */
export interface DatePickerPanelBaseProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Helper text to be displayed below the date picker.
   */
  helperText?: string;
  /**
   * The visible month for the first visible calendar
   */
  visibleMonth?: TDate;
  /**
   * Number of columns.
   */
  columns?: ResponsiveProp<number | string>;
  /**
   * Number of visible months, maximum 12, defaults to 1
   */
  numberOfVisibleMonths?: ResponsiveProp<
    1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  >;
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
   * Props to be passed to the CalendarNavigation component.
   */
  CalendarNavigationProps?: Partial<CalendarNavigationProps<TDate>>;
  /**
   * Props to be passed to the CalendarGrid component.
   */
  CalendarGridProps?: Partial<CalendarGridProps<TDate>>;
}

const withBaseName = makePrefixer("saltDatePickerPanel");

export type DatePickerSingleGridPanelProps<TDate extends DateFrameworkType> =
  DatePickerPanelBaseProps<TDate> &
    SingleDateSelection<TDate> & {
      onSelectionChange?: (
        event: SyntheticEvent,
        selectedDate?: TDate | null,
      ) => void;
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
    };

export const DatePickerSingleGridPanel = forwardRef(
  function DatePickerSingleGridPanel<TDate extends DateFrameworkType>(
    props: DatePickerSingleGridPanelProps<TDate>,
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
      numberOfVisibleMonths = 1,
      columns = numberOfVisibleMonths,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-date-picker-single-grid-panel",
      css: datePickerPanelCss,
      window: targetWindow,
    });

    const stateAndHelpers: SingleDatePickerState<TDate> = useDatePickerContext({
      selectionVariant: "single",
    });

    const {
      state: {
        timezone,
        selectedDate = null,
        minDate = dateAdapter.startOf(dateAdapter.today(timezone), "month"),
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
      const validDate = dateAdapter.isValid(selectedDate)
        ? selectedDate
        : dateAdapter.today(timezone);
      return defaultVisibleMonth || dateAdapter.startOf(validDate, "month");
    });
    const [visibleMonth, setVisibleMonth] = useControlled({
      controlled: visibleMonthProp,
      default: uncontrolledDefaultVisibleMonth,
      name: "DatePickerSingleGridPanel",
      state: "visibleMonth",
    });

    const handleSelectionChange = useCallback(
      (
        event: SyntheticEvent,
        newDate: TDate | DateRangeSelection<TDate> | null,
      ) => {
        const singleDate = newDate as TDate | null;
        select(event, singleDate);
        onSelectionChange?.(event, singleDate);
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
      isDayDisabled,
      isDayHighlighted,
      isDayUnselectable,
      onHoveredDateChange: handleHoveredDateChange,
      onVisibleMonthChange: handleVisibleMonthChange,
      onSelectionChange: handleSelectionChange,
      hideOutOfRangeDates: true,
      selectedDate,
      minDate,
      maxDate,
      numberOfVisibleMonths: responsiveNumberOfVisibleMonths,
      timezone,
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
              selectionVariant={"single"}
              {...(calendarProps as Partial<CalendarSingleProps<TDate>>)}
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
