import {
  FlexItem,
  FlexLayout,
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldHelperText,
  makePrefixer,
  StackLayout,
  useControlled,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import type {
  DateFrameworkType,
  SaltDateAdapter,
  Timezone,
} from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useRef,
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
  type DateRangeSelection,
  type UseCalendarSelectionRangeProps,
} from "../calendar";
import { generateDatesForMonth } from "../calendar/internal/utils";
import { useLocalization } from "../localization-provider";
import { useDatePickerContext } from "./DatePickerContext";
import { useDatePickerOverlay } from "./DatePickerOverlayProvider";
import datePickerPanelCss from "./DatePickerPanel.css";

/**
 * Props for the DatePickerRangePanel component.
 * @template TDate - The type of the date object.
 */
export interface DatePickerRangePanelProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Callback fired when a date range is selected.
   * @param event - The synthetic event.
   * @param selectedDate - The selected date range or null.
   */
  onSelectionChange?: (
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
   * @param event - The synthetic event, or null if called by effect.
   * @param visibleMonth - The new visible month for the start date.
   */
  onStartVisibleMonthChange?: (
    event: SyntheticEvent | null,
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
   * @param event - The synthetic event or null if triggered by code.
   * @param visibleMonth - The new visible month for the end date.
   */
  onEndVisibleMonthChange?: (
    event: SyntheticEvent | null,
    visibleMonth: TDate,
  ) => void;

  /**
   * Callback fired when the focused date changes.
   * @param event - The synthetic event or null if triggered by code.
   * @param focusedDate - The new focused date.
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
      | "multiselect"
      | "onFocusedDateChange"
      | "onHoveredDateChange"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;
  /**
   * Props to be passed to the start date CalendarGrid component.
   */
  StartCalendarGridProps?: CalendarGridProps<TDate>;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarProps?: Partial<
    Omit<
      CalendarRangeProps<TDate>,
      | "selectedDate"
      | "defaultSelectedDate"
      | "multiselect"
      | "onFocusedDateChange"
      | "onHoveredDateChange"
      | "onSelectionChange"
      | "onVisibleMonthChange"
    >
  >;

  /**
   * Props to be passed to the end date CalendarNavigation component.
   */
  EndCalendarNavigationProps?: CalendarNavigationProps<TDate>;
  /**
   * Props to be passed to the end date CalendarGrid component.
   */
  EndCalendarGridProps?: CalendarGridProps<TDate>;
}

function getFallbackVisibleMonths<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  selectedDate: DateRangeSelection<TDate> | null,
  timezone: Timezone = "default",
) {
  function createConsecutiveRange(date: TDate) {
    const startDate = dateAdapter.startOf(date, "month");
    const endDate = dateAdapter.add(startDate, { months: 1 });
    return [startDate, endDate];
  }

  if (selectedDate && dateAdapter.isValid(selectedDate?.startDate)) {
    const { startDate, endDate } = selectedDate;
    if (dateAdapter.isValid(endDate)) {
      return dateAdapter.isSame(startDate, endDate, "month")
        ? createConsecutiveRange(startDate)
        : [
            dateAdapter.startOf(startDate, "month"),
            dateAdapter.startOf(endDate, "month"),
          ];
    }
    return createConsecutiveRange(startDate);
  }

  const currentMonth = dateAdapter.startOf(
    dateAdapter.today(timezone),
    "month",
  );
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
    onFocusedDateChange,
    onHoveredDateChange,
    onSelectionChange,
    StartCalendarProps: StartCalendarPropsProp,
    StartCalendarNavigationProps,
    StartCalendarGridProps,
    EndCalendarProps: EndCalendarPropsProp,
    EndCalendarNavigationProps,
    EndCalendarGridProps,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-date-picker-range-panel",
    css: datePickerPanelCss,
    window: targetWindow,
  });

  const calendarsRef = useRef<HTMLDivElement>(null);
  const containerRef = useForkRef(ref, calendarsRef);

  const {
    state: {
      timezone,
      selectedDate,
      minDate = dateAdapter.startOf(dateAdapter.today(timezone), "month"),
      maxDate = dateAdapter.add(minDate, { months: 1 }),
    },
    helpers: { select, isDayHighlighted, isDayUnselectable },
  } = useDatePickerContext<TDate>({ selectionVariant: "range" });

  const {
    state: { initialFocusRef, focused },
  } = useDatePickerOverlay();

  const [hoveredDate, setHoveredDate] = useState<TDate | null>(null);

  const [[fallbackStartVisibleMonth, fallbackEndVisibleMonth]] = useState(() =>
    getFallbackVisibleMonths<TDate>(dateAdapter, selectedDate, timezone),
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
      select(event, newDate);
      onSelectionChange?.(event, newDate);
    },
    [select, onSelectionChange],
  );

  const handleHoveredStartDateChange: CalendarProps<TDate>["onHoveredDateChange"] =
    useCallback(
      (event: SyntheticEvent, newHoveredDate: TDate | null) => {
        setHoveredDate(newHoveredDate);
        onHoveredDateChange?.(event, newHoveredDate);
      },
      [onHoveredDateChange],
    );

  const handleHoveredEndDateChange = useCallback(
    (event: SyntheticEvent, newHoveredDate: TDate | null) => {
      setHoveredDate(newHoveredDate);
      onHoveredDateChange?.(event, newHoveredDate);
    },
    [onHoveredDateChange],
  );

  const handleStartVisibleMonthChange = useCallback(
    (event: SyntheticEvent | null, newVisibleMonth: TDate) => {
      setStartVisibleMonth(newVisibleMonth);
      if (dateAdapter.compare(newVisibleMonth, endVisibleMonth) >= 0) {
        setEndVisibleMonth(dateAdapter.add(newVisibleMonth, { months: 1 }));
      }
      onStartVisibleMonthChange?.(event, newVisibleMonth);
    },
    [dateAdapter, endVisibleMonth, onStartVisibleMonthChange],
  );

  const handleEndVisibleMonthChange = useCallback(
    (event: SyntheticEvent | null, newVisibleMonth: TDate) => {
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
    [dateAdapter, startVisibleMonth, onEndVisibleMonthChange],
  );

  const calendarSelectedDate = {
    startDate:
      selectedDate && dateAdapter.isValid(selectedDate.startDate)
        ? selectedDate.startDate
        : null,
    endDate:
      selectedDate && dateAdapter.isValid(selectedDate.endDate)
        ? selectedDate.endDate
        : null,
  };

  const [focusedDate, setFocusedDate] = useState<TDate | null>(null);

  const handleStartCalendarFocusedDateChange = useCallback(
    (event: SyntheticEvent | null, newFocusedDate: TDate) => {
      setFocusedDate(newFocusedDate);
      if (
        newFocusedDate &&
        !dateAdapter.isSame(startVisibleMonth, newFocusedDate, "month")
      ) {
        handleStartVisibleMonthChange(
          event,
          dateAdapter.startOf(newFocusedDate, "month"),
        );
      }
      onFocusedDateChange?.(event, newFocusedDate);
    },
    [
      dateAdapter,
      startVisibleMonth,
      handleStartVisibleMonthChange,
      onFocusedDateChange,
    ],
  );

  const handleEndCalendarFocusedDateChange = useCallback(
    (event: SyntheticEvent | null, newFocusedDate: TDate) => {
      setFocusedDate(newFocusedDate);
      if (
        newFocusedDate &&
        !dateAdapter.isSame(endVisibleMonth, newFocusedDate, "month")
      ) {
        handleEndVisibleMonthChange(
          event,
          dateAdapter.startOf(newFocusedDate, "month"),
        );
      }
      onFocusedDateChange?.(event, newFocusedDate);
    },
    [
      dateAdapter,
      endVisibleMonth,
      handleEndVisibleMonthChange,
      onFocusedDateChange,
    ],
  );

  const getNextFocusedDate = (
    nextStartVisibleMonth: TDate,
    nextEndVisibleMonth: TDate,
  ) => {
    const isOutsideAllowedDates = (date: TDate) => {
      return (
        dateAdapter.compare(date, minDate) < 0 ||
        dateAdapter.compare(date, maxDate) > 0
      );
    };
    const isDaySelectable = (date: TDate) =>
      !(date && (isDayUnselectable?.(date) || isOutsideAllowedDates(date)));

    const getVisibleSelectedDate = (visibleMonth: TDate) => {
      if (
        selectedDate?.startDate &&
        dateAdapter.isSame(visibleMonth, selectedDate.startDate, "month") &&
        isDaySelectable(selectedDate.startDate)
      ) {
        return selectedDate.startDate;
      }
      if (
        selectedDate?.endDate &&
        dateAdapter.isSame(visibleMonth, selectedDate.endDate, "month") &&
        isDaySelectable(selectedDate.endDate)
      ) {
        return selectedDate.endDate;
      }
      return null;
    };
    let focusSelectedDate = getVisibleSelectedDate(nextStartVisibleMonth);
    focusSelectedDate =
      focusSelectedDate ?? getVisibleSelectedDate(nextEndVisibleMonth);
    if (focusSelectedDate && isDaySelectable(focusSelectedDate)) {
      return focusSelectedDate;
    }
    // Today
    const today = dateAdapter.today(timezone);
    if (
      (dateAdapter.isSame(nextStartVisibleMonth, today, "month") ||
        dateAdapter.isSame(nextEndVisibleMonth, today, "month")) &&
      isDaySelectable(today)
    ) {
      return today;
    }
    // First selectable date in either calendar
    const getFirstSelectableDate = (visibleMonth: TDate) => {
      const firstSelectableDate = generateDatesForMonth(
        dateAdapter,
        visibleMonth,
      ).find((visibleDay) => isDaySelectable(visibleDay));
      return firstSelectableDate ?? null;
    };

    return (
      getFirstSelectableDate(nextStartVisibleMonth) ??
      getFirstSelectableDate(nextEndVisibleMonth)
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: only run when focus/min/max date changes
  useIsomorphicLayoutEffect(() => {
    if (!focused) {
      setFocusedDate(null);
      return;
    }

    const isStartDateValid =
      selectedDate?.startDate &&
      dateAdapter.isValid(selectedDate.startDate) &&
      dateAdapter.compare(selectedDate.startDate, minDate) >= 0 &&
      dateAdapter.compare(selectedDate.startDate, maxDate) <= 0;

    const isEndDateValid =
      selectedDate?.endDate &&
      dateAdapter.isValid(selectedDate.endDate) &&
      dateAdapter.compare(selectedDate.endDate, minDate) >= 0 &&
      dateAdapter.compare(selectedDate.endDate, maxDate) <= 0;

    let nextStartVisibleMonth = startVisibleMonth;
    let nextEndVisibleMonth = endVisibleMonth;

    const setVisibleMonths = (
      start: typeof nextStartVisibleMonth,
      end: typeof nextEndVisibleMonth,
    ) => {
      nextStartVisibleMonth = dateAdapter.startOf(start, "month");
      nextEndVisibleMonth = dateAdapter.startOf(end, "month");
    };

    if (
      selectedDate?.startDate &&
      selectedDate?.endDate &&
      isStartDateValid &&
      isEndDateValid
    ) {
      if (
        dateAdapter.isSame(
          selectedDate.startDate,
          startVisibleMonth,
          "month",
        ) &&
        dateAdapter.isSame(selectedDate.endDate, startVisibleMonth, "month")
      ) {
        setVisibleMonths(
          selectedDate.startDate,
          dateAdapter.add(selectedDate.startDate, { months: 1 }),
        );
      } else {
        setVisibleMonths(selectedDate.startDate, selectedDate.endDate);
      }
    } else if (selectedDate?.startDate && isStartDateValid) {
      setVisibleMonths(
        selectedDate.startDate,
        dateAdapter.add(selectedDate.startDate, { months: 1 }),
      );
    } else if (selectedDate?.endDate && isEndDateValid) {
      setVisibleMonths(
        dateAdapter.subtract(selectedDate.endDate, { months: 1 }),
        selectedDate.endDate,
      );
    }

    if (!focusedDate) {
      setFocusedDate((prevFocusedDate) => {
        if (!prevFocusedDate) {
          return getNextFocusedDate(nextStartVisibleMonth, nextEndVisibleMonth);
        }
        return prevFocusedDate;
      });
    }
  }, [dateAdapter, minDate, maxDate, focused]);

  const StartCalendarProps = {
    visibleMonth: startVisibleMonth,
    hoveredDate,
    selectedDate: calendarSelectedDate,
    isDayHighlighted,
    isDayUnselectable,
    focusedDateRef: initialFocusRef,
    focusedDate:
      focusedDate &&
      dateAdapter.compare(
        focusedDate,
        dateAdapter.startOf(endVisibleMonth, "month"),
      ) < 0
        ? focusedDate
        : null,
    onHoveredDateChange: handleHoveredStartDateChange,
    onFocusedDateChange: handleStartCalendarFocusedDateChange,
    onVisibleMonthChange: handleStartVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    timezone,
    ...StartCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;
  const EndCalendarProps = {
    visibleMonth: endVisibleMonth,
    hoveredDate,
    isDayHighlighted,
    isDayUnselectable,
    focusedDateRef: initialFocusRef,
    focusedDate:
      focusedDate &&
      dateAdapter.compare(
        focusedDate,
        dateAdapter.startOf(endVisibleMonth, "month"),
      ) >= 0
        ? focusedDate
        : null,
    selectedDate: calendarSelectedDate,
    onFocusedDateChange: handleEndCalendarFocusedDateChange,
    onHoveredDateChange: handleHoveredEndDateChange,
    onVisibleMonthChange: handleEndVisibleMonthChange,
    onSelectionChange: handleSelectionChange,
    hideOutOfRangeDates: true,
    minDate,
    maxDate,
    timezone,
    ...EndCalendarPropsProp,
  } as Partial<UseCalendarSelectionRangeProps<TDate>>;

  return (
    <StackLayout
      separators
      gap={0}
      className={clsx(className, withBaseName("container"))}
      ref={containerRef}
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
            <CalendarNavigation
              disableNavigateNext={dateAdapter.isSame(
                startVisibleMonth,
                dateAdapter.subtract(maxDate, { months: 1 }),
                "month",
              )}
              {...StartCalendarNavigationProps}
            />
            <CalendarGrid {...StartCalendarGridProps} />
          </Calendar>
          <Calendar selectionVariant={"range"} {...EndCalendarProps}>
            <CalendarNavigation
              disableNavigatePrevious={dateAdapter.isSame(
                endVisibleMonth,
                dateAdapter.add(minDate, { months: 1 }),
                "month",
              )}
              {...EndCalendarNavigationProps}
            />
            <CalendarGrid {...EndCalendarGridProps} />
          </Calendar>
        </FormFieldContext.Provider>
      </FlexLayout>
    </StackLayout>
  );
});
