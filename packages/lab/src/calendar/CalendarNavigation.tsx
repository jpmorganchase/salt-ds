import {
  Button,
  type ButtonProps,
  Dropdown,
  type DropdownProps,
  Option,
  type OptionProps,
  Tooltip,
  type TooltipProps,
  makePrefixer,
  useIcon,
  useListControlContext,
} from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type MouseEventHandler,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import { CALENDAR_MAX_YEAR, CALENDAR_MIN_YEAR } from "./useCalendarSelection";

import {
  CalendarDate,
  type DateValue,
  isSameMonth,
  isSameYear,
} from "@internationalized/date";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import calendarNavigationCss from "./CalendarNavigation.css";
import { formatDate } from "./formatDate";
import { monthDiff, monthsForLocale } from "./internal/utils";

type DateDropdownProps = DropdownProps<DateValue>;

/**
 * Props for the CalendarNavigation component.
 */
export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  /**
   * Props for the month dropdown component.
   */
  MonthDropdownProps?: DateDropdownProps;

  /**
   * Props for the year dropdown component.
   */
  YearDropdownProps?: DateDropdownProps;

  /**
   * Callback fired when a month is selected.
   * @param event - The change event.
   */
  onMonthSelect?: DateDropdownProps["onChange"];

  /**
   * Callback fired when a year is selected.
   * @param event - The change event.
   */
  onYearSelect?: DateDropdownProps["onChange"];

  /**
   * Callback fired when navigating to the next month.
   * @param event - The click event.
   */
  onNavigateNext?: ButtonProps["onClick"];

  /**
   * Callback fired when navigating to the previous month.
   * @param event - The click event.
   */
  onNavigatePrevious?: ButtonProps["onClick"];

  /**
   * If `true`, hides the year dropdown.
   */
  hideYearDropdown?: boolean;

  /**
   * The step value for navigation. Defaults to 1.
   */
  step?: number;
  /**
   * Format the month dropdown values
   * @param date
   */
  formatMonth?: (date: DateValue) => string;
  /**
   * Format the year dropdown values
   * @param date
   */
  formatYear?: (date: DateValue) => string;
}

interface OptionWithTooltipProps extends OptionProps {
  value: DateValue;
  tooltipContent?: string;
}

const withBaseName = makePrefixer("saltCalendarNavigation");

const ConditionalTooltip: React.FC<TooltipProps> = ({
  children,
  disabled = true,
  ...rest
}) => {
  if (disabled) {
    return <>{children}</>;
  }
  return <Tooltip {...rest}>{children}</Tooltip>;
};

function generateYearsBetweenRange(
  minYear: number,
  maxYear: number,
): DateValue[] {
  const years: DateValue[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(new CalendarDate(year, 1, 1));
  }
  return years;
}

function useCalendarNavigation() {
  const {
    state: { visibleMonth, minDate, maxDate, locale, timeZone },
    helpers: {
      setVisibleMonth,
      isDayVisible,
      isOutsideAllowedYears,
      isOutsideAllowedMonths,
    },
  } = useCalendarContext();

  const moveToNextMonth = useCallback(
    (event: SyntheticEvent, step = 1) => {
      setVisibleMonth(event, visibleMonth.add({ months: step }));
    },
    [setVisibleMonth, visibleMonth],
  );

  const moveToPreviousMonth = useCallback(
    (event: SyntheticEvent, step = 1) => {
      setVisibleMonth(event, visibleMonth.subtract({ months: step }));
    },
    [setVisibleMonth, visibleMonth],
  );

  const moveToMonth = useCallback(
    (event: SyntheticEvent, month: DateValue) => {
      let newMonth = month;

      if (!isOutsideAllowedYears(newMonth)) {
        if (isOutsideAllowedMonths(newMonth)) {
          // If month is navigable we should move to the closest navigable month
          const navigableMonths = monthsForLocale(visibleMonth, locale).filter(
            (n) => !isOutsideAllowedMonths(n),
          );
          newMonth = navigableMonths.reduce((closestMonth, currentMonth) =>
            Math.abs(monthDiff(currentMonth, newMonth)) <
            Math.abs(monthDiff(closestMonth, newMonth))
              ? currentMonth
              : closestMonth,
          );
        }
        setVisibleMonth(event, newMonth);
      }
    },
    [
      isOutsideAllowedYears,
      isOutsideAllowedMonths,
      setVisibleMonth,
      visibleMonth,
      locale,
    ],
  );

  const months: DateValue[] = useMemo(
    () => monthsForLocale(visibleMonth, locale),
    [visibleMonth, locale],
  );

  const years: DateValue[] = useMemo(
    () =>
      generateYearsBetweenRange(
        Math.min(minDate ? minDate.year : CALENDAR_MIN_YEAR, visibleMonth.year),
        Math.max(maxDate ? maxDate.year : CALENDAR_MAX_YEAR, visibleMonth.year),
      ),
    [minDate, maxDate, visibleMonth.year],
  );

  const selectedMonth: DateValue | undefined = months.find((month: DateValue) =>
    isSameMonth(month, visibleMonth),
  );
  const selectedYear: DateValue | undefined = years.find((year: DateValue) =>
    isSameYear(year, visibleMonth),
  );

  const canNavigatePrevious = !(minDate && isDayVisible(minDate));
  const canNavigateNext = !(maxDate && isDayVisible(maxDate));

  return useMemo(
    () => ({
      moveToNextMonth,
      moveToPreviousMonth,
      moveToMonth,
      visibleMonth,
      months,
      years,
      canNavigateNext,
      canNavigatePrevious,
      selectedMonth,
      selectedYear,
      isOutsideAllowedMonths,
      locale,
      timeZone,
    }),
    [
      months,
      moveToPreviousMonth,
      moveToNextMonth,
      moveToMonth,
      visibleMonth,
      years,
      canNavigateNext,
      canNavigatePrevious,
      selectedMonth,
      selectedYear,
      isOutsideAllowedMonths,
      locale,
      timeZone,
    ],
  );
}

const OptionWithTooltip = ({
  value,
  children,
  disabled = false,
  tooltipContent,
}: OptionWithTooltipProps) => {
  const { activeState, openState } = useListControlContext();
  const open = activeState?.value === value;
  return (
    <ConditionalTooltip
      placement="right"
      open={open && openState}
      disabled={!disabled}
      content={tooltipContent}
      enterDelay={0} // --salt-duration-instant
      leaveDelay={0} // --salt-duration-instant
    >
      <Option value={value} disabled={disabled}>
        {children}
      </Option>
    </ConditionalTooltip>
  );
};

export const CalendarNavigation = forwardRef<
  HTMLDivElement,
  CalendarNavigationProps
>(function CalendarNavigation(props, ref) {
  const {
    className,
    formatMonth: formatMonthProp,
    formatYear: formatYearProp,
    MonthDropdownProps,
    YearDropdownProps,
    hideYearDropdown,
    step = 1,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-navigation",
    css: calendarNavigationCss,
    window: targetWindow,
  });

  const { NextIcon, PreviousIcon } = useIcon();

  const {
    moveToPreviousMonth,
    moveToNextMonth,
    moveToMonth,
    months,
    years,
    canNavigateNext,
    canNavigatePrevious,
    selectedMonth,
    selectedYear,
    isOutsideAllowedMonths,
    locale,
  } = useCalendarNavigation();

  const handleNavigatePrevious: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      (event) => {
        moveToPreviousMonth(event, step);
      },
      [moveToPreviousMonth, step],
    );

  const handleNavigateNext: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      moveToNextMonth(event, step);
    },
    [moveToNextMonth, step],
  );

  const handleMonthSelect = useCallback(
    (event: SyntheticEvent, month: DateValue[]) => {
      moveToMonth(event, month[0]);
    },
    [moveToMonth],
  );

  const handleYearSelect = useCallback(
    (event: SyntheticEvent, year: DateValue[]) => {
      moveToMonth(event, year[0]);
    },
    [moveToMonth],
  );

  const formatMonth = useCallback(
    (date?: DateValue) => {
      if (date && formatMonthProp) {
        return formatMonthProp(date);
      }
      return !date
        ? ""
        : formatDate(date, locale, {
            month: hideYearDropdown ? "long" : "short",
            day: undefined,
            year: undefined,
          });
    },
    [formatMonthProp],
  );

  const formatYear = useCallback(
    (date?: DateValue) => {
      if (date && formatYearProp) {
        return formatYearProp(date);
      }
      return !date ? "" : `${date.year}`;
    },
    [formatYearProp],
  );

  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName("hideYearDropdown")]: hideYearDropdown },
        className,
      )}
      ref={ref}
      {...rest}
    >
      <ConditionalTooltip
        placement="top"
        disabled={canNavigatePrevious}
        content="Past dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigatePrevious}
          appearance="transparent"
          sentiment="neutral"
          onClick={handleNavigatePrevious}
          focusableWhenDisabled={true}
        >
          <PreviousIcon aria-label="Previous Month" />
        </Button>
      </ConditionalTooltip>
      <div className={clsx({ [withBaseName("dropdowns")]: !hideYearDropdown })}>
        <Dropdown
          aria-label="Month Dropdown"
          selected={selectedMonth ? [selectedMonth] : []}
          value={formatMonth(selectedMonth)}
          onSelectionChange={handleMonthSelect}
          {...MonthDropdownProps}
        >
          {months.map((month) => (
            <OptionWithTooltip
              key={formatMonth(month)}
              value={month}
              disabled={isOutsideAllowedMonths(month)}
              tooltipContent="This month is out of range"
            >
              {formatMonth(month)}
            </OptionWithTooltip>
          ))}
        </Dropdown>
        {!hideYearDropdown && (
          <Dropdown
            aria-label="Year Dropdown"
            selected={selectedYear ? [selectedYear] : []}
            value={formatYear(selectedYear)}
            onSelectionChange={handleYearSelect}
            {...YearDropdownProps}
          >
            {years.map((year) => (
              <OptionWithTooltip key={formatYear(year)} value={year}>
                {formatYear(year)}
              </OptionWithTooltip>
            ))}
          </Dropdown>
        )}
      </div>
      <ConditionalTooltip
        placement="top"
        disabled={canNavigateNext}
        content="Future dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigateNext}
          appearance="transparent"
          sentiment="neutral"
          onClick={handleNavigateNext}
          focusableWhenDisabled={true}
        >
          <NextIcon aria-label="Next Month" />
        </Button>
      </ConditionalTooltip>
    </div>
  );
});
