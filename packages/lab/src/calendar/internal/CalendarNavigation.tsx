import {
  Button,
  ButtonProps,
  makePrefixer,
  Tooltip,
  useId,
} from "@salt-ds/core";
import { ChevronLeftIcon, ChevronRightIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import {
  ComponentPropsWithRef,
  forwardRef,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { DropdownNext, DropdownNextProps } from "../../dropdown-next";

import { useCalendarContext } from "./CalendarContext";

import calendarNavigationCss from "./CalendarNavigation.css";
import { DateValue, isSameMonth, isSameYear } from "@internationalized/date";
import { formatDate, monthDiff, monthsForLocale } from "./utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { Option } from "../../option";
import { useListControlContext } from "../../list-control/ListControlContext";

type dateDropdownProps = DropdownNextProps<DateValue>;

export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  MonthDropdownProps?: dateDropdownProps;
  YearDropdownProps?: dateDropdownProps;
  onMonthSelect?: dateDropdownProps["onChange"];
  onYearSelect?: dateDropdownProps["onChange"];
  onNavigateNext?: ButtonProps["onClick"];
  onNavigatePrevious?: ButtonProps["onClick"];
  hideYearDropdown?: boolean;
}

interface OptionWithTooltipProps {
  item: DateValue;
  dateFormatter: (item: DateValue) => string;
  disabled?: boolean;
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
          (n) => !isOutsideAllowedMonths(n)
        );
        newMonth = navigableMonths.reduce((closestMonth, currentMonth) =>
          Math.abs(monthDiff(currentMonth, newMonth)) <
          Math.abs(monthDiff(closestMonth, newMonth))
            ? currentMonth
            : closestMonth
        );
      }
      setVisibleMonth(event, newMonth);
    }
  };

  const months: DateValue[] = monthsForLocale(visibleMonth);

  const years: DateValue[] = [-2, -1, 0, 1, 2]
    .map((delta) => visibleMonth.add({ years: delta }))
    .filter((year) => !isOutsideAllowedYears(year));

  const selectedMonth: DateValue | undefined = months.find((month: DateValue) =>
    isSameMonth(month, visibleMonth)
  );
  const selectedYear: DateValue | undefined = years.find((year: DateValue) =>
    isSameYear(year, visibleMonth)
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
  item,
  disabled,
  dateFormatter,
  tooltipContent,
}: OptionWithTooltipProps) => {
  const { activeState } = useListControlContext();
  const id = useId();
  const open = activeState?.id === id ? true : undefined;
  const formattedItem = dateFormatter(item);
  return (
    <Tooltip
      placement="right"
      open={open}
      disabled={!disabled}
      content={tooltipContent}
      enterDelay={0} // --salt-duration-instant
    >
      <Option value={item} disabled={disabled} id={id}>
        {formattedItem}
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
    event
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

  const monthDropdownId = useId(MonthDropdownProps?.id) ?? "";
  const monthDropdownLabelledBy = clsx(
    MonthDropdownProps?.["aria-labelledby"],
    // TODO need a prop on Dropdown to allow buttonId to be passed, should not make assumptions about internal
    // id assignment like this
    `${monthDropdownId}-control`
  );

  const yearDropdownId = useId(YearDropdownProps?.id) ?? "";
  const yearDropdownLabelledBy = clsx(
    YearDropdownProps?.["aria-labelledby"],
    `${yearDropdownId}-control`
  );

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
        className
      )}
      ref={ref}
      {...rest}
    >
      <Tooltip
        placement="top"
        disabled={canNavigatePrevious}
        content="Past dates are out of range"
        enterDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigatePrevious}
          variant="secondary"
          onClick={handleNavigatePrevious}
          focusableWhenDisabled={true}
        >
          <ChevronLeftIcon
            aria-label={`Previous Month, ${formatDate(
              visibleMonth.subtract({ months: 1 })
            )}`}
          />
        </Button>
      </Tooltip>
      <div className={withBaseName("dropdowns")}>
        <DropdownNext
          aria-labelledby={monthDropdownLabelledBy}
          aria-label="Month Dropdown"
          id={monthDropdownId}
          selected={selectedMonth ? [selectedMonth] : []}
          value={formatMonth(selectedMonth)}
          onSelectionChange={handleMonthSelect}
          {...MonthDropdownProps}
        >
          {months.map((month) => (
            <OptionWithTooltip
              key={formatMonth(month)}
              item={month}
              dateFormatter={formatMonth}
              disabled={isOutsideAllowedMonths(month)}
              tooltipContent="This month is out of range"
            />
          ))}
        </DropdownNext>
        {!hideYearDropdown && (
          <DropdownNext
            id={yearDropdownId}
            aria-labelledby={yearDropdownLabelledBy}
            aria-label="Year Dropdown"
            selected={selectedYear ? [selectedYear] : []}
            value={formatYear(selectedYear)}
            onSelectionChange={handleYearSelect}
            {...YearDropdownProps}
          >
            {years.map((year) => (
              <OptionWithTooltip
                key={formatYear(year)}
                item={year}
                dateFormatter={formatYear}
                tooltipContent="This year is out of range"
              />
            ))}
          </DropdownNext>
        )}
      </div>
      <Tooltip
        placement="top"
        disabled={canNavigateNext}
        content="Future dates are out of range"
        enterDelay={0} // --salt-duration-instant
      >
        <Button
          disabled={!canNavigateNext}
          variant="secondary"
          onClick={handleNavigateNext}
          focusableWhenDisabled={true}
        >
          <ChevronRightIcon
            aria-label={`Next Month, ${formatDate(
              visibleMonth.add({ months: 1 })
            )}`}
          />
        </Button>
      </Tooltip>
    </div>
  );
});
