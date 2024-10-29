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
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type MouseEventHandler,
  type SyntheticEvent,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import {
  type DateFrameworkType,
  type SaltDateAdapter,
  useLocalization,
} from "../date-adapters";
import calendarNavigationCss from "./CalendarNavigation.css";
import { useCalendarContext } from "./internal/CalendarContext";
import { generateMonthsForYear, monthDiff } from "./internal/utils";

/**
 * Props for the CalendarNavigation component.
 */
export interface CalendarNavigationProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithRef<"div"> {
  /**
   * Props for the month dropdown component.
   */
  MonthDropdownProps?: DropdownProps<TDate>;

  /**
   * Props for the year dropdown component.
   */
  YearDropdownProps?: DropdownProps<TDate>;

  /**
   * Callback fired when a month is selected.
   * @param event - The change event.
   */
  onMonthSelect?: DropdownProps<TDate>["onChange"];

  /**
   * Callback fired when a year is selected.
   * @param event - The change event.
   */
  onYearSelect?: DropdownProps<TDate>["onChange"];

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
  formatMonth?: string;
  /**
   * Format the year dropdown values
   * @param date
   */
  formatYear?: string;
}

interface OptionWithTooltipProps<TDate> extends OptionProps {
  value: TDate;
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

function generateYearsBetweenRange<TDate extends DateFrameworkType>(
  dateAdapter: SaltDateAdapter<TDate>,
  minYear: number,
  maxYear: number,
): TDate[] {
  const years: TDate[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    let startOfYear = dateAdapter.today();
    startOfYear = dateAdapter.set(startOfYear, { day: 1, month: 1, year });
    years.push(startOfYear);
  }
  return years;
}

function useCalendarNavigation<TDate extends DateFrameworkType>() {
  const {
    state: { visibleMonth, locale, minDate, maxDate },
    helpers: {
      setVisibleMonth,
      isDayVisible,
      isOutsideAllowedYears,
      isOutsideAllowedMonths,
    },
  } = useCalendarContext<TDate>();

  const { dateAdapter } = useLocalization<TDate>();

  const moveToNextMonth = useCallback(
    (event: SyntheticEvent, step = 1) => {
      setVisibleMonth(event, dateAdapter.add(visibleMonth, { months: step }));
    },
    [dateAdapter, setVisibleMonth, visibleMonth],
  );

  const moveToPreviousMonth = useCallback(
    (event: SyntheticEvent, step = 1) => {
      setVisibleMonth(
        event,
        dateAdapter.subtract(visibleMonth, { months: step }),
      );
    },
    [dateAdapter, setVisibleMonth, visibleMonth],
  );

  const moveToMonth = useCallback(
    (event: SyntheticEvent, month: TDate) => {
      let newMonth = month;

      if (!isOutsideAllowedYears(newMonth)) {
        if (isOutsideAllowedMonths(newMonth)) {
          // If month is navigable we should move to the closest navigable month
          const navigableMonths = generateMonthsForYear(
            dateAdapter,
            visibleMonth,
          ).filter((n) => !isOutsideAllowedMonths(n));
          newMonth = navigableMonths.reduce((closestMonth, currentMonth) =>
            Math.abs(monthDiff(dateAdapter, currentMonth, newMonth)) <
            Math.abs(monthDiff(dateAdapter, closestMonth, newMonth))
              ? currentMonth
              : closestMonth,
          );
        }
        setVisibleMonth(event, newMonth);
      }
    },
    [
      dateAdapter,
      isOutsideAllowedYears,
      isOutsideAllowedMonths,
      setVisibleMonth,
      visibleMonth,
    ],
  );

  const months: TDate[] = useMemo(
    () => generateMonthsForYear<TDate>(dateAdapter, visibleMonth),
    [visibleMonth],
  );

  const years: TDate[] = useMemo(
    () =>
      generateYearsBetweenRange<TDate>(
        dateAdapter,
        Math.min(
          dateAdapter.getYear(minDate),
          dateAdapter.getYear(visibleMonth),
        ),
        Math.max(
          dateAdapter.getYear(maxDate),
          dateAdapter.getYear(visibleMonth),
        ),
      ),
    [dateAdapter, minDate, maxDate, visibleMonth],
  );

  const selectedMonth: TDate | undefined = months.find((month: TDate) =>
    dateAdapter.isSame(month, visibleMonth, "month"),
  );
  const selectedYear: TDate | undefined = years.find((year: TDate) =>
    dateAdapter.isSame(year, visibleMonth, "year"),
  );

  const canNavigatePrevious = !isDayVisible(minDate);
  const canNavigateNext = !isDayVisible(maxDate);

  return useMemo(
    () => ({
      moveToNextMonth,
      moveToPreviousMonth,
      moveToMonth,
      visibleMonth,
      locale,
      months,
      years,
      canNavigateNext,
      canNavigatePrevious,
      selectedMonth,
      selectedYear,
      isOutsideAllowedMonths,
    }),
    [
      locale,
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
    ],
  );
}

function OptionWithTooltip<TDate extends DateFrameworkType>({
  value,
  children,
  disabled = false,
  tooltipContent,
}: OptionWithTooltipProps<TDate>) {
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
}

export const CalendarNavigation = forwardRef<
  HTMLDivElement,
  CalendarNavigationProps<any>
>(
  <TDate extends DateFrameworkType>(
    props: CalendarNavigationProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
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

    const { dateAdapter } = useLocalization<TDate>();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-navigation",
      css: calendarNavigationCss,
      window: targetWindow,
    });

    const { NextIcon, PreviousIcon } = useIcon();

    const {
      locale,
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
    } = useCalendarNavigation<TDate>();

    const handleNavigatePrevious: MouseEventHandler<HTMLButtonElement> =
      useCallback(
        (event) => {
          moveToPreviousMonth(event, step);
        },
        [moveToPreviousMonth, step],
      );

    const handleNavigateNext: MouseEventHandler<HTMLButtonElement> =
      useCallback(
        (event) => {
          moveToNextMonth(event, step);
        },
        [moveToNextMonth, step],
      );

    const handleMonthSelect = useCallback(
      (event: SyntheticEvent, month: TDate[]) => {
        moveToMonth(event, month[0]);
      },
      [moveToMonth],
    );

    const handleYearSelect = useCallback(
      (event: SyntheticEvent, year: TDate[]) => {
        moveToMonth(event, year[0]);
      },
      [moveToMonth],
    );

    const formatMonth = useCallback(
      (date?: TDate) => {
        if (date && formatMonthProp) {
          return dateAdapter.format(date, formatMonthProp, locale);
        }
        return date
          ? dateAdapter.format(date, hideYearDropdown ? "MMMM" : "MMM")
          : "";
      },
      [dateAdapter, formatMonthProp, locale],
    );

    const formatYear = useCallback(
      (date?: TDate) => {
        if (date && formatYearProp) {
          return dateAdapter.format(date, formatYearProp);
        }
        return !date ? "" : `${dateAdapter.format(date, "YYYY")}`;
      },
      [dateAdapter, formatYearProp],
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
        <div
          className={clsx({ [withBaseName("dropdowns")]: !hideYearDropdown })}
        >
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
  },
);
