import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, useCallback } from "react";

import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useLocalization } from "../localization-provider";
import calendarMonthHeaderCss from "./CalendarMonthHeader.css";
import { useCalendarContext } from "./internal/CalendarContext";

/**
 * Props for the CalendarMonthHeader component.
 * @template TDate - The type of the date object.
 */
export interface CalendarMonthHeaderProps<TDate extends DateFrameworkType>
  extends ComponentPropsWithRef<"div"> {
  /**
   * Month value
   */
  month: TDate;
  /**
   * Format the month value
   * @param date
   */
  format?: string;
}

const withBaseName = makePrefixer("saltCalendarMonthHeader");

export const CalendarMonthHeader = forwardRef<
  HTMLDivElement,
  CalendarMonthHeaderProps<DateFrameworkType>
>(
  <TDate extends DateFrameworkType>(
    props: CalendarMonthHeaderProps<TDate>,
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const {
      className,
      format: formatMonthProp = "MMMM",
      month,
      ...rest
    } = props;
    const { dateAdapter } = useLocalization<TDate>();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-month-header",
      css: calendarMonthHeaderCss,
      window: targetWindow,
    });

    const formatMonth = useCallback(
      (date?: TDate) => {
        return dateAdapter.format(date, formatMonthProp);
      },
      [dateAdapter, formatMonthProp],
    );

    return (
      <div
        data-testid="CalendarMonthHeader"
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      >
        <small>{formatMonth(month)}</small>
      </div>
    );
  },
);
