import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  type ResponsiveProp,
  resolveResponsiveValue,
  StackLayout,
  useBreakpoint,
  useControlled,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Calendar,
  CalendarGrid,
  type CalendarGridProps,
  CalendarNavigation,
  type CalendarNavigationProps,
  type CalendarSingleProps,
  type DateRangeSelection,
  type SingleDateSelection,
} from "../calendar";
import { generateDatesForMonth } from "../calendar/internal/utils";
import { useLocalization } from "../localization-provider";
import {
  type SingleDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
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
   * @param event - The synthetic event or null if triggered by code.
   * @param visibleMonth - The new visible month.
   */
  onVisibleMonthChange?: (
    event: SyntheticEvent | null,
    visibleMonth: TDate,
  ) => void;
  /**
   * Callback fired when the focused date changes.
   * @param event - The synthetic event or null if triggered by code.
   * @param focusedDate - The new hovered date.
   */
  onFocusedDateChange?: (
    event: SyntheticEvent | null,
    focusedDate?: TDate | null,
  ) => void;
  /**
   * Callback fired when the hovered date changes.
   * @param event - The synthetic event.
   * @param hoveredDate - The new hovered date.
   */
  onHoveredDateChange?: (
    event: SyntheticEvent,
    hoveredDate?: TDate | null,
  ) => void;
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
      onFocusedDateChange,
      onHoveredDateChange,
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
      helpers: { select, isDayHighlighted, isDayUnselectable },
    } = stateAndHelpers;

    const { matchedBreakpoints } = useBreakpoint();

    const responsiveColumns =
      resolveResponsiveValue(columns, matchedBreakpoints) ?? 1;
    const responsiveNumberOfVisibleMonths =
      resolveResponsiveValue(numberOfVisibleMonths, matchedBreakpoints) ?? 1;

    const {
      state: { focused, initialFocusRef },
    } = useDatePickerOverlay();

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

    const [focusedDate, setFocusedDate] = useState<TDate | null>(null);
    const calendarGridFocused = useRef(false);

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
        onHoveredDateChange?.(event, newHoveredDate);
      },
      [onHoveredDateChange],
    );

    const handleVisibleMonthChange = useCallback(
      (event: SyntheticEvent | null, newVisibleMonth: TDate) => {
        setVisibleMonth(newVisibleMonth);
        onVisibleMonthChange?.(event, newVisibleMonth);
      },
      [onVisibleMonthChange],
    );

    const handleFocusedDateChange = useCallback(
      (event: SyntheticEvent | null, newFocusedDate: TDate) => {
        setFocusedDate(newFocusedDate);
        if (!newFocusedDate) {
          onFocusedDateChange?.(event, newFocusedDate);
          return;
        }

        const startOfFocusedMonth = dateAdapter.startOf(
          newFocusedDate,
          "month",
        );
        const lastVisibleMonth = dateAdapter.add(visibleMonth, {
          months: responsiveNumberOfVisibleMonths - 1,
        });

        const isBeforeVisibleMonth =
          dateAdapter.compare(startOfFocusedMonth, visibleMonth) < 0;
        const isAfterLastVisibleMonth =
          dateAdapter.compare(startOfFocusedMonth, lastVisibleMonth) > 0;

        if (isBeforeVisibleMonth) {
          handleVisibleMonthChange(event, startOfFocusedMonth);
        } else if (isAfterLastVisibleMonth) {
          const newLastVisibleMonth = dateAdapter.subtract(
            startOfFocusedMonth,
            {
              months: responsiveNumberOfVisibleMonths - 1,
            },
          );
          handleVisibleMonthChange(event, newLastVisibleMonth);
        }
        onFocusedDateChange?.(event, newFocusedDate);
      },
      [
        dateAdapter,
        handleVisibleMonthChange,
        onFocusedDateChange,
        responsiveNumberOfVisibleMonths,
        visibleMonth,
      ],
    );

    const getNextFocusedDate = useCallback(() => {
      const isOutsideAllowedDates = (date: TDate) => {
        return (
          dateAdapter.compare(date, minDate) < 0 ||
          dateAdapter.compare(date, maxDate) > 0
        );
      };
      const isDaySelectable = (date: TDate) =>
        !(date && (isDayUnselectable?.(date) || isOutsideAllowedDates(date)));

      const startVisibleMonth = dateAdapter.startOf(visibleMonth, "month");
      const endVisibleMonth = dateAdapter.add(visibleMonth, {
        months: responsiveNumberOfVisibleMonths - 1,
      });
      const selectedDateStartOfMonth = selectedDate
        ? dateAdapter.startOf(selectedDate, "month")
        : null;

      const getVisibleSelectedDate = () => {
        if (
          selectedDateStartOfMonth &&
          dateAdapter.compare(selectedDateStartOfMonth, startVisibleMonth) >=
            0 &&
          dateAdapter.compare(selectedDateStartOfMonth, endVisibleMonth) <= 0
        ) {
          return selectedDate;
        }
        return null;
      };

      const focusSelectedDate = getVisibleSelectedDate();
      if (focusSelectedDate && isDaySelectable(focusSelectedDate)) {
        return focusSelectedDate;
      }

      // Today
      const today = dateAdapter.today(timezone);
      const todayStartOfMonth = dateAdapter.startOf(today, "month");
      if (
        dateAdapter.compare(todayStartOfMonth, startVisibleMonth) >= 0 &&
        dateAdapter.compare(todayStartOfMonth, endVisibleMonth) <= 0 &&
        isDaySelectable(today)
      ) {
        return today;
      }

      // First selectable date across visible months
      const getFirstSelectableDate = (
        startMonth: TDate,
        numberOfMonths: number,
      ) => {
        for (let i = 0; i < numberOfMonths; i++) {
          const currentMonth = dateAdapter.add(startMonth, { months: i });
          const firstSelectableDate = generateDatesForMonth(
            dateAdapter,
            currentMonth,
          ).find((visibleDay) => isDaySelectable(visibleDay));

          if (firstSelectableDate) {
            return firstSelectableDate;
          }
        }

        return null;
      };

      return getFirstSelectableDate(
        startVisibleMonth,
        responsiveNumberOfVisibleMonths,
      );
    }, [
      dateAdapter,
      isDayUnselectable,
      minDate,
      maxDate,
      responsiveNumberOfVisibleMonths,
      selectedDate,
      visibleMonth,
      timezone,
    ]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: only run when focus/min/max date changes
    useLayoutEffect(() => {
      // Called when the overlay opens or the focus shifts between trigger and overlay
      if (focused && !calendarGridFocused.current) {
        setFocusedDate((prevFocusedDate) => {
          if (!prevFocusedDate) {
            return getNextFocusedDate();
          }
          return prevFocusedDate;
        });
      }
      calendarGridFocused.current = focused;
    }, [focused]);

    const calendarProps = {
      visibleMonth,
      focusedDateRef: initialFocusRef,
      focusedDate: calendarGridFocused?.current ? focusedDate : null,
      hoveredDate,
      isDayHighlighted,
      isDayUnselectable,
      hideOutOfRangeDates: true,
      selectedDate,
      minDate,
      maxDate,
      numberOfVisibleMonths: responsiveNumberOfVisibleMonths,
      onFocusedDateChange: handleFocusedDateChange,
      onHoveredDateChange: handleHoveredDateChange,
      onSelectionChange: handleSelectionChange,
      onVisibleMonthChange: handleVisibleMonthChange,
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
