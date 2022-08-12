import {
  Button,
  ButtonProps,
  makePrefixer,
  Tooltip,
  useForkRef,
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
import { IndexedListItemProps, ListItemBase, useListItem } from "../../list";
import { useCalendarContext } from "./CalendarContext";
import dayjs from "./dayjs";

import "./CalendarNavigation.css";

type DropdownItem = {
  value: Date;
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
    helpers: { setVisibleMonth, isDayVisible, isDateNavigable },
  } = useCalendarContext();

  const moveToNextMonth = (event: SyntheticEvent) => {
    setVisibleMonth(event, dayjs(visibleMonth).add(1, "month").toDate());
  };

  const moveToPreviousMonth = (event: SyntheticEvent) => {
    setVisibleMonth(event, dayjs(visibleMonth).subtract(1, "month").toDate());
  };

  const moveToMonth = (event: SyntheticEvent, month: Date) => {
    let newMonth = month;

    if (isDateNavigable(newMonth, "year")) {
      if (!isDateNavigable(newMonth, "month")) {
        // If month is navigable we should move to the closest navigable month
        const navigableMonths = dayjs
          .months()
          .map((_, index) => dayjs(newMonth).set("month", index).toDate())
          .filter((n) => isDateNavigable(n, "month"));
        newMonth = navigableMonths.reduce((closestMonth, currentMonth) =>
          Math.abs(dayjs(currentMonth).diff(newMonth, "month")) <
          Math.abs(dayjs(closestMonth).diff(newMonth, "month"))
            ? currentMonth
            : closestMonth
        );
      }
      setVisibleMonth(event, newMonth);
    }
  };

  const months = dayjs.months().map((month, monthIndex) => {
    const date = dayjs(visibleMonth).set("month", monthIndex).toDate();
    return { value: date, disabled: !isDateNavigable(date, "month") };
  });

  const years = [-2, -1, 0, 1, 2]
    .map((delta) => {
      const date = dayjs(visibleMonth).add(delta, "years").toDate();
      return { value: date };
    })
    .filter(({ value }) => isDateNavigable(value, "year"));

  const selectedMonth = months.find((item: DropdownItem) =>
    dayjs(item.value).isSame(visibleMonth, "month")
  );
  const selectedYear = years.find((item: DropdownItem) =>
    dayjs(item.value).isSame(visibleMonth, "year")
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

const ListItemWithTooltip = forwardRef<
  HTMLDivElement,
  IndexedListItemProps<DropdownItem>
>((props, ref) => {
  const { item, itemProps, itemToString } = useListItem<DropdownItem>(props);

  const { getTooltipProps, getTriggerProps } = useTooltip({
    placement: "right",
    disabled: !item.disabled,
  });

  const { ref: triggerRef, ...triggerProps } =
    getTriggerProps<typeof ListItemBase>(itemProps);

  const handleRef = useForkRef(triggerRef, ref);

  return (
    <>
      <ListItemBase ref={handleRef} {...triggerProps}>
        <label
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {itemToString(item)}
        </label>
      </ListItemBase>
      <Tooltip
        {...getTooltipProps({
          title: "Out of range",
        })}
      />
    </>
  );
});

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

  const handleMonthSelect: dateDropdownProps["onChange"] = (event, month) => {
    if (month) {
      moveToMonth(event, month.value);
    }
  };

  const handleYearSelect: dateDropdownProps["onChange"] = (event, year) => {
    if (year) {
      moveToMonth(event, year.value);
    }
  };

  const monthDropdownId = useId(MonthDropdownProps?.id);
  const monthDropdownLabelledBy = cx(
    MonthDropdownProps?.["aria-labelledby"],
    monthDropdownId
  );
  const yearDropdownId = useId(YearDropdownProps?.id);
  const yearDropdownLabelledBy = cx(
    YearDropdownProps?.["aria-labelledby"],
    yearDropdownId
  );

  const defaultItemToMonth = (date: DropdownItem) => {
    if (hideYearDropdown) {
      return dayjs(date.value).format("MMMM");
    }
    return dayjs(date.value).format("MMM");
  };

  const defaultItemToYear = (date: DropdownItem) => {
    return dayjs(date.value).format("YYYY");
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
          aria-label={`Previous Month, ${dayjs(visibleMonth)
            .subtract(1, "month")
            .format("MMMM YYYY")}`}
        />
      </Button>
      <Dropdown<DropdownItem>
        source={months}
        id={monthDropdownId}
        aria-labelledby={monthDropdownLabelledBy}
        aria-label="Month Dropdown"
        {...MonthDropdownProps}
        ListItem={ListItemWithTooltip}
        selectedItem={selectedMonth}
        itemToString={defaultItemToMonth}
        onChange={handleMonthSelect}
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
          selectedItem={selectedYear}
          onChange={handleYearSelect}
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
          aria-label={`Next Month, ${dayjs(visibleMonth)
            .add(1, "month")
            .format("MMMM YYYY")}`}
        />
      </Button>
    </div>
  );
});
