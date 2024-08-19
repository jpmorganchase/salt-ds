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
  useListControlContext,
} from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
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

type dateDropdownProps = DropdownProps<DateValue>;

export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  MonthDropdownProps?: dateDropdownProps;
  YearDropdownProps?: dateDropdownProps;
  onMonthSelect?: dateDropdownProps["onChange"];
  onYearSelect?: dateDropdownProps["onChange"];
  onNavigateNext?: ButtonProps["onClick"];
  onNavigatePrevious?: ButtonProps["onClick"];
  hideYearDropdown?: boolean;
  step?: number;
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
    [isOutsideAllowedYears, isOutsideAllowedMonths, visibleMonth, locale],
  );

  const months: DateValue[] = useMemo(
    () => monthsForLocale(visibleMonth, locale),
    [visibleMonth, locale],
  );
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

  const formatMonth = (date?: DateValue) => {
    return !date
      ? ""
      : formatDate(date, locale, {
          month: hideYearDropdown ? "long" : "short",
          day: undefined,
          year: undefined,
        });
  };

  const formatYear = (date?: DateValue) => {
    return !date ? "" : `${date.year}`;
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
      <ConditionalTooltip
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
          variant="secondary"
          onClick={handleNavigateNext}
          focusableWhenDisabled={true}
        >
          <ChevronRightIcon aria-label="Next Month" />
        </Button>
      </ConditionalTooltip>
    </div>
  );
});
