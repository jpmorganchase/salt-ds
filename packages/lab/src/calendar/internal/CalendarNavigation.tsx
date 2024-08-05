import {
  Button,
  type ButtonProps,
  Dropdown,
  type DropdownProps,
  Option,
  type OptionProps,
  Tooltip,
  makePrefixer,
  useListControlContext,
} from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type MouseEventHandler,
  type SyntheticEvent,
  forwardRef,
} from "react";
import { CALENDAR_MAX_YEAR, CALENDAR_MIN_YEAR } from "../useCalendarSelection";
import { useCalendarContext } from "./CalendarContext";

import {
  CalendarDate,
  type DateValue,
  isSameMonth,
  isSameYear,
} from "@internationalized/date";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import calendarNavigationCss from "./CalendarNavigation.css";
import { formatDate, monthDiff, monthsForLocale } from "./utils";

type dateDropdownProps = DropdownProps<DateValue>;

export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  MonthDropdownProps?: dateDropdownProps;
  YearDropdownProps?: dateDropdownProps;
  onMonthSelect?: dateDropdownProps["onChange"];
  onYearSelect?: dateDropdownProps["onChange"];
  borderedDropdown?: dateDropdownProps["bordered"];
  onNavigateNext?: ButtonProps["onClick"];
  onNavigatePrevious?: ButtonProps["onClick"];
  hideYearDropdown?: boolean;
}

interface OptionWithTooltipProps extends OptionProps {
  value: DateValue;
  tooltipContent: string;
}

const withBaseName = makePrefixer("saltCalendarNavigation");

function useCalendarNavigation() {
  const {
    state: { visibleMonth, minDate, maxDate },
    helpers: {
      setVisibleMonth,
      isDayVisible,
      isOutsideAllowedYears,
      isOutsideAllowedMonths,
    },
  } = useCalendarContext();

  const moveToNextMonth = (event: SyntheticEvent) => {
    setVisibleMonth(event, visibleMonth.add({ months: 1 }));
  };

  const moveToPreviousMonth = (event: SyntheticEvent) => {
    setVisibleMonth(event, visibleMonth.subtract({ months: 1 }));
  };

  const moveToMonth = (event: SyntheticEvent, month: DateValue) => {
    let newMonth = month;

    if (!isOutsideAllowedYears(newMonth)) {
      if (isOutsideAllowedMonths(newMonth)) {
        // If month is navigable we should move to the closest navigable month
        const navigableMonths = monthsForLocale(visibleMonth).filter(
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

  const months: DateValue[] = monthsForLocale(visibleMonth);
  const years: DateValue[] = generateYearsBetweenRange(
    Math.min(minDate ? minDate.year : CALENDAR_MIN_YEAR, visibleMonth.year),
    Math.max(maxDate ? maxDate.year : CALENDAR_MAX_YEAR, visibleMonth.year),
  );

  const selectedMonth: DateValue | undefined = months.find((month: DateValue) =>
    isSameMonth(month, visibleMonth),
  );
  const selectedYear: DateValue | undefined = years.find((year: DateValue) =>
    isSameYear(year, visibleMonth),
  );

  const canNavigatePrevious = !(minDate && isDayVisible(minDate));
  const canNavigateNext = !(maxDate && isDayVisible(maxDate));

  return {
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
  };
}

const OptionWithTooltip = ({
  value,
  children,
  disabled,
  tooltipContent,
}: OptionWithTooltipProps) => {
  const { activeState, openState } = useListControlContext();
  const open = activeState?.value === value;

  return (
    <Tooltip
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
    </Tooltip>
  );
};

export const CalendarNavigation = forwardRef<
  HTMLDivElement,
  CalendarNavigationProps
>(function CalendarNavigation(props, ref) {
  const {
    className,
    MonthDropdownProps,
    YearDropdownProps,
    hideYearDropdown,
    borderedDropdown,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-navigation",
    css: calendarNavigationCss,
    window: targetWindow,
  });

  const {
    moveToPreviousMonth,
    moveToNextMonth,
    moveToMonth,
    months,
    years,
    canNavigateNext,
    canNavigatePrevious,
    visibleMonth,
    selectedMonth,
    selectedYear,
    isOutsideAllowedMonths,
  } = useCalendarNavigation();

  const handleNavigatePrevious: MouseEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    moveToPreviousMonth(event);
  };

  const handleNavigateNext: MouseEventHandler<HTMLButtonElement> = (event) => {
    moveToNextMonth(event);
  };

  const handleMonthSelect = (event: SyntheticEvent, month: DateValue[]) => {
    moveToMonth(event, month[0]);
  };

  const handleYearSelect = (event: SyntheticEvent, year: DateValue[]) => {
    moveToMonth(event, year[0]);
  };

  const formatMonth = (date?: DateValue) => {
    return !date
      ? ""
      : formatDate(date, { month: hideYearDropdown ? "long" : "short" });
  };

  const formatYear = (date?: DateValue) => {
    return !date ? "" : formatDate(date, { year: "numeric" });
  };

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
      <Tooltip
        placement="top"
        disabled={canNavigatePrevious}
        content="Past dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigatePrevious}
          variant="secondary"
          onClick={handleNavigatePrevious}
          focusableWhenDisabled={true}
        >
          <ChevronLeftIcon aria-label="Previous Month" />
        </Button>
      </Tooltip>
      <div className={withBaseName("dropdowns")}>
        <Dropdown
          bordered={borderedDropdown}
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
            bordered={borderedDropdown}
            {...YearDropdownProps}
          >
            {years.map((year) => (
              <OptionWithTooltip
                key={formatYear(year)}
                value={year}
                tooltipContent="This year is out of range"
              >
                {formatYear(year)}
              </OptionWithTooltip>
            ))}
          </Dropdown>
        )}
      </div>
      <Tooltip
        placement="top"
        disabled={canNavigateNext}
        content="Future dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigateNext}
          variant="secondary"
          onClick={handleNavigateNext}
          focusableWhenDisabled={true}
        >
          <ChevronRightIcon aria-label="Next Month" />
        </Button>
      </Tooltip>
    </div>
  );
});
