import {
  Button,
  ButtonProps,
  makePrefixer,
  Tooltip,
  useId,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { ChevronLeftIcon, ChevronRightIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import {
  ComponentPropsWithRef,
  forwardRef,
  MouseEventHandler,
  SyntheticEvent,
} from "react";
import { Dropdown, DropdownProps } from "../../dropdown";
import { ListItem, ListItemType } from "../../list";

import { useCalendarContext } from "./CalendarContext";

import "./CalendarNavigation.css";
import {
  DateValue,
  endOfMonth,
  endOfYear,
  isSameMonth,
  isSameYear,
  startOfMonth,
  startOfYear,
} from "@internationalized/date";
import { formatDate, monthDiff, monthsForLocale } from "./utils";
import { SelectionChangeHandler } from "../../common-hooks";

type DropdownItem = {
  value: DateValue;
  disabled?: boolean;
};

type dateDropdownProps = DropdownProps<DropdownItem>;

export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  MonthDropdownProps?: dateDropdownProps;
  YearDropdownProps?: dateDropdownProps;
  onMonthSelect?: dateDropdownProps["onChange"];
  onYearSelect?: dateDropdownProps["onChange"];
  onNavigateNext?: ButtonProps["onClick"];
  onNavigatePrevious?: ButtonProps["onClick"];
  hideYearDropdown?: boolean;
}

const withBaseName = makePrefixer("uitkCalendarNavigation");

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

  const months = monthsForLocale(visibleMonth).map((month) => {
    return { value: month, disabled: isOutsideAllowedMonths(month) };
  });

  const years = [-2, -1, 0, 1, 2]
    .map((delta) => ({ value: visibleMonth.add({ years: delta }) }))
    .filter(({ value }) => !isOutsideAllowedYears(value));

  const selectedMonth = months.find((item: DropdownItem) =>
    isSameMonth(item.value, visibleMonth)
  );
  const selectedYear = years.find((item: DropdownItem) =>
    isSameYear(item.value, visibleMonth)
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
  };
}

const ListItemWithTooltip: ListItemType<DropdownItem> = ({
  item,
  label,
  ...props
}) => {
  const { getTooltipProps, getTriggerProps } = useTooltip({
    placement: "right",
    disabled: !item?.disabled,
  });

  const { ref: triggerRef, ...triggerProps } =
    getTriggerProps<typeof ListItem>(props);

  return (
    <ListItem ref={triggerRef} {...triggerProps}>
      {label}
      <Tooltip
        {...getTooltipProps({
          title: "Out of range",
        })}
      />
    </ListItem>
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
  } = useCalendarNavigation();

  const handleNavigatePrevious: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    moveToPreviousMonth(event);
  };

  const handleNavigateNext: MouseEventHandler<HTMLButtonElement> = (event) => {
    moveToNextMonth(event);
  };

  const handleMonthSelect: SelectionChangeHandler<DropdownItem> = (
    event,
    month
  ) => {
    if (month) {
      moveToMonth(event, month.value);
    }
  };

  const handleYearSelect: SelectionChangeHandler<DropdownItem> = (
    event,
    year
  ) => {
    if (year) {
      moveToMonth(event, year.value);
    }
  };

  const monthDropdownId = useId(MonthDropdownProps?.id);
  const monthDropdownLabelledBy = cx(
    MonthDropdownProps?.["aria-labelledby"],
    // TODO need a prop on Dropdown to allow buttonId to be passed, should not make assumptions about internal
    // id assignment like this
    `${monthDropdownId}-control`
  );
  const yearDropdownId = useId(YearDropdownProps?.id);
  const yearDropdownLabelledBy = cx(
    YearDropdownProps?.["aria-labelledby"],
    `${yearDropdownId}-control`
  );

  const defaultItemToMonth = (date: DropdownItem) => {
    if (hideYearDropdown) {
      return formatDate(date.value, { month: "long" });
    }
    return formatDate(date.value, { month: "short" });
  };

  const defaultItemToYear = (date: DropdownItem) => {
    return formatDate(date.value, { year: "numeric" });
  };

  return (
    <div
      className={cx(
        withBaseName(),
        { [withBaseName("hideYearDropdown")]: hideYearDropdown },
        className
      )}
      ref={ref}
      {...rest}
    >
      <Button
        disabled={!canNavigatePrevious}
        variant="secondary"
        onClick={handleNavigatePrevious}
        className={withBaseName("previousButton")}
      >
        <ChevronLeftIcon
          aria-label={`Previous Month, ${formatDate(
            visibleMonth.subtract({ months: 1 })
          )}`}
        />
      </Button>
      <Dropdown<DropdownItem>
        source={months}
        id={monthDropdownId}
        aria-labelledby={monthDropdownLabelledBy}
        aria-label="Month Dropdown"
        {...MonthDropdownProps}
        ListItem={ListItemWithTooltip}
        selected={selectedMonth}
        itemToString={defaultItemToMonth}
        onSelectionChange={handleMonthSelect}
        fullWidth
      />
      {!hideYearDropdown && (
        <Dropdown<DropdownItem>
          source={years}
          id={yearDropdownId}
          aria-labelledby={yearDropdownLabelledBy}
          aria-label="Year Dropdown"
          {...YearDropdownProps}
          ListItem={ListItemWithTooltip}
          selected={selectedYear}
          onSelectionChange={handleYearSelect}
          itemToString={defaultItemToYear}
          fullWidth
        />
      )}
      <Button
        disabled={!canNavigateNext}
        variant="secondary"
        onClick={handleNavigateNext}
        className={withBaseName("nextButton")}
      >
        <ChevronRightIcon
          aria-label={`Next Month, ${formatDate(
            visibleMonth.add({ months: 1 })
          )}`}
        />
      </Button>
    </div>
  );
});
