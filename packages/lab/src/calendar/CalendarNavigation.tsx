import {
  Button,
  type ButtonProps,
  Dropdown,
  type DropdownProps,
  makePrefixer,
  Option,
  type OptionProps,
  Tooltip,
  type TooltipProps,
  useIcon,
  useListControlContext,
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
  type ComponentPropsWithRef,
  forwardRef,
  type MouseEventHandler,
  type SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import { useLocalization } from "../localization-provider";
import calendarNavigationCss from "./CalendarNavigation.css";
import { useCalendarContext } from "./internal/CalendarContext";
import { generateMonthsForYear, monthDiff } from "./internal/utils";

/**
 * Props for the CalendarNavigation component.
 */
export interface CalendarNavigationProps extends ComponentPropsWithRef<"div"> {
  /**
   * Props for the month dropdown component.
   */
  MonthDropdownProps?: DropdownProps<DateFrameworkType>;
  /**
   * Props for the year dropdown component.
   */
  YearDropdownProps?: DropdownProps<DateFrameworkType>;
  /**
   * Additional props for Previous button.
   */
  PreviousButtonProps?: ButtonProps;
  /**
   * Additional props for Next button.
   */
  NextButtonProps?: ButtonProps;
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

interface OptionWithTooltipProps extends OptionProps {
  value: DateFrameworkType;
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
  dateAdapter: SaltDateAdapter<DateFrameworkType>,
  minYear: number,
  maxYear: number,
  timezone: Timezone = "default",
): DateFrameworkType[] {
  const years: DateFrameworkType[] = [];
  let startOfYear = dateAdapter.today(timezone);
  for (let year = minYear; year <= maxYear; year++) {
    startOfYear = dateAdapter.set(startOfYear, { day: 1, month: 1, year });
    years.push(startOfYear);
  }
  return years;
}

function useCalendarNavigation() {
  const {
    state: { visibleMonth, timezone, minDate, maxDate },
    helpers: { setVisibleMonth, isDayVisible, isOutsideAllowedMonths },
  } = useCalendarContext();

  const { dateAdapter } = useLocalization<DateFrameworkType>();

  const disableNavigatePrevious = isDayVisible(minDate);
  const disableNavigateNext = isDayVisible(maxDate);

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
    (event: SyntheticEvent, month: DateFrameworkType) => {
      let newMonth = month;

      if (isOutsideAllowedMonths(newMonth)) {
        // If month is navigable we should move to the closest navigable month based on the new selection
        const navigableMonths = generateMonthsForYear(
          dateAdapter,
          newMonth,
        ).filter((n) => !isOutsideAllowedMonths(n));
        newMonth = navigableMonths.reduce(
          (closestMonth, currentMonth) =>
            Math.abs(monthDiff(dateAdapter, currentMonth, newMonth)) <
            Math.abs(monthDiff(dateAdapter, closestMonth, newMonth))
              ? currentMonth
              : closestMonth,
          minDate,
        );
      }
      setVisibleMonth(event, newMonth);
    },
    [dateAdapter, isOutsideAllowedMonths, setVisibleMonth, visibleMonth],
  );

  const months: DateFrameworkType[] = useMemo(
    () => generateMonthsForYear(dateAdapter, visibleMonth),
    [dateAdapter, visibleMonth],
  );

  const years: DateFrameworkType[] = useMemo(
    () =>
      generateYearsBetweenRange(
        dateAdapter,
        Math.min(
          dateAdapter.getYear(minDate),
          dateAdapter.getYear(visibleMonth),
        ),
        Math.max(
          dateAdapter.getYear(maxDate),
          dateAdapter.getYear(visibleMonth),
        ),
        timezone,
      ),
    [dateAdapter, minDate, maxDate, visibleMonth, timezone],
  );

  const selectedMonth: DateFrameworkType | undefined = months.find(
    (month: DateFrameworkType) =>
      dateAdapter.isSame(month, visibleMonth, "month"),
  );
  const selectedYear: DateFrameworkType | undefined = years.find(
    (year: DateFrameworkType) => dateAdapter.isSame(year, visibleMonth, "year"),
  );

  return useMemo(
    () => ({
      moveToNextMonth,
      moveToPreviousMonth,
      moveToMonth,
      visibleMonth,
      months,
      years,
      disableNavigateNext,
      disableNavigatePrevious,
      selectedMonth,
      selectedYear,
      isOutsideAllowedMonths,
    }),
    [
      months,
      moveToPreviousMonth,
      moveToNextMonth,
      moveToMonth,
      visibleMonth,
      years,
      disableNavigateNext,
      disableNavigatePrevious,
      selectedMonth,
      selectedYear,
      isOutsideAllowedMonths,
    ],
  );
}

function OptionWithTooltip({
  value,
  children,
  disabled = false,
  tooltipContent,
  ...rest
}: OptionWithTooltipProps) {
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
      <Option value={value} disabled={disabled} {...rest}>
        {children}
      </Option>
    </ConditionalTooltip>
  );
}

export const CalendarNavigation = forwardRef<
  HTMLDivElement,
  CalendarNavigationProps
>((props: CalendarNavigationProps, ref: React.Ref<HTMLDivElement>) => {
  const {
    className,
    formatMonth: formatMonthProp,
    formatYear: formatYearProp,
    MonthDropdownProps,
    NextButtonProps,
    PreviousButtonProps,
    YearDropdownProps,
    hideYearDropdown,
    step = 1,
    ...rest
  } = props;

  const { dateAdapter } = useLocalization<DateFrameworkType>();

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
    disableNavigateNext,
    disableNavigatePrevious,
    selectedMonth,
    selectedYear,
    isOutsideAllowedMonths,
    visibleMonth,
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
    (event: SyntheticEvent, month: DateFrameworkType[]) => {
      moveToMonth(event, month[0]);
    },
    [moveToMonth],
  );

  const handleYearSelect = useCallback(
    (event: SyntheticEvent, year: DateFrameworkType[]) => {
      let newVisibleMonth = dateAdapter.clone(visibleMonth);
      newVisibleMonth = dateAdapter.set(newVisibleMonth, {
        year: dateAdapter.getYear(year[0]),
      });
      moveToMonth(event, newVisibleMonth);
    },
    [dateAdapter, moveToMonth, visibleMonth],
  );

  const formatMonth = useCallback(
    (date?: DateFrameworkType, formatString?: string) => {
      const format = formatString || formatMonthProp || "MMM";
      if (date) {
        return dateAdapter.format(date, format);
      }
      return "";
    },
    [dateAdapter, formatMonthProp],
  );

  const formatYear = useCallback(
    (date?: DateFrameworkType) => {
      if (date && formatYearProp) {
        return dateAdapter.format(date, formatYearProp);
      }
      return !date ? "" : `${dateAdapter.format(date, "YYYY")}`;
    },
    [dateAdapter, formatYearProp],
  );

  const isPreviousMonthDisabled =
    PreviousButtonProps?.disabled || disableNavigatePrevious;
  const isNextMonthDisabled = NextButtonProps?.disabled || disableNavigateNext;

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
        disabled={!isPreviousMonthDisabled}
        content="Past dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          aria-label={
            isPreviousMonthDisabled
              ? "Past dates are out of range"
              : "Previous Month"
          }
          appearance="transparent"
          sentiment="neutral"
          onClick={handleNavigatePrevious}
          focusableWhenDisabled={true}
          {...PreviousButtonProps}
          disabled={isPreviousMonthDisabled}
        >
          <PreviousIcon aria-hidden />
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
              aria-label={formatMonth(month, "MMMM")}
              disabled={isOutsideAllowedMonths(month)}
              tooltipContent="This month is out of range"
            >
              {formatMonth(month)}
            </OptionWithTooltip>
          ))}
        </Dropdown>
        {!hideYearDropdown ? (
          <Dropdown
            aria-label="Year Dropdown"
            selected={selectedYear ? [selectedYear] : []}
            value={formatYear(selectedYear)}
            onSelectionChange={handleYearSelect}
            {...YearDropdownProps}
            className={clsx(
              withBaseName("yearDropdown"),
              YearDropdownProps?.className,
            )}
          >
            {years.map((year) => (
              <OptionWithTooltip key={formatYear(year)} value={year}>
                {formatYear(year)}
              </OptionWithTooltip>
            ))}
          </Dropdown>
        ) : null}
      </div>
      <ConditionalTooltip
        placement="top"
        disabled={!isNextMonthDisabled}
        content="Future dates are out of range"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
      >
        <Button
          aria-label={
            isNextMonthDisabled ? "Future dates are out of range" : "Next Month"
          }
          appearance="transparent"
          sentiment="neutral"
          onClick={handleNavigateNext}
          focusableWhenDisabled={true}
          {...NextButtonProps}
          disabled={isNextMonthDisabled}
        >
          <NextIcon aria-hidden />
        </Button>
      </ConditionalTooltip>
    </div>
  );
});
