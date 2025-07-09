import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  resolveResponsiveValue,
  StackLayout,
  useBreakpoint,
  useControlled,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
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
  CalendarNavigation,
  type CalendarRangeProps,
  type DateRangeSelection,
} from "../calendar";
import { generateDatesForMonth } from "../calendar/internal/utils";
import { useLocalization } from "../localization-provider";
import {
  type RangeDatePickerState,
  useDatePickerContext,
} from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
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
          | "onHoveredDateChange"
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
      onFocusedDateChange,
      onHoveredDateChange,
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
      state: { focused, initialFocusRef },
    } = useDatePickerOverlay();

    const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);
    const [focusedDate, setFocusedDate] = useState<TDate | null>(null);
    const calendarGridFocused = useRef(false);

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

    const [uncontrolledDefaultVisibleMonth] = useState(() => {
      const validDate: TDate =
        selectedDate?.startDate && dateAdapter.isValid(selectedDate.startDate)
          ? selectedDate.startDate
          : dateAdapter.today(timezone);

      // Ensure that defaultVisibleMonth is used if provided, otherwise use the start of the valid date
      return defaultVisibleMonth || dateAdapter.startOf(validDate, "month");
    });

    const [visibleMonth, setVisibleMonth] = useControlled({
      controlled: visibleMonthProp,
      default: uncontrolledDefaultVisibleMonth,
      name: "DatePickerRangeGridPanel",
      state: "visibleMonth",
    });

    const getNextFocusedDate = () => {
      const isOutsideAllowedDates = (date: TDate) => {
        return (
          dateAdapter.compare(date, minDate) < 0 ||
          dateAdapter.compare(date, maxDate) > 0
        );
      };

      const isDaySelectable = (date: TDate) =>
        !(
          date &&
          (isDayUnselectable?.(date) ||
            isDayDisabled?.(date) ||
            isOutsideAllowedDates(date))
        );

      const startVisibleMonth = dateAdapter.startOf(visibleMonth, "month");
      const endVisibleMonth = dateAdapter.add(visibleMonth, {
        months: responsiveNumberOfVisibleMonths - 1,
      });

      const getVisibleSelectedDate = () => {
        const startDateStartOfMonth = selectedDate?.startDate
          ? dateAdapter.startOf(selectedDate.startDate, "month")
          : null;
        const endDateStartOfMonth = selectedDate?.endDate
          ? dateAdapter.startOf(selectedDate.endDate, "month")
          : null;
        if (
          selectedDate?.startDate &&
          startDateStartOfMonth &&
          dateAdapter.compare(startDateStartOfMonth, startVisibleMonth) >= 0 &&
          dateAdapter.compare(startDateStartOfMonth, endVisibleMonth) <= 0 &&
          isDaySelectable(selectedDate?.startDate)
        ) {
          return selectedDate?.startDate;
        }
        if (
          selectedDate?.endDate &&
          endDateStartOfMonth &&
          dateAdapter.compare(endDateStartOfMonth, startVisibleMonth) >= 0 &&
          dateAdapter.compare(endDateStartOfMonth, endVisibleMonth) <= 0 &&
          isDaySelectable(selectedDate?.endDate)
        ) {
          return selectedDate?.endDate;
        }
        return null;
      };

      const focusSelectedDate = getVisibleSelectedDate();
      if (focusSelectedDate) {
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
    };

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
            { months: responsiveNumberOfVisibleMonths - 1 },
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
      numberOfVisibleMonths: responsiveNumberOfVisibleMonths,
      onFocusedDateChange: handleFocusedDateChange,
      onHoveredDateChange: handleHoveredDateChange,
      onSelectionChange: handleSelectionChange,
      onVisibleMonthChange: handleVisibleMonthChange,
      hideOutOfRangeDates: true,
      isDayDisabled,
      isDayHighlighted,
      isDayUnselectable,
      selectedDate,
      minDate,
      maxDate,
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
              selectionVariant={"range"}
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
