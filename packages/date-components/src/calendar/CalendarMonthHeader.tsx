import { makePrefixer, Text } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, useCallback } from "react";
import { useLocalization } from "../localization-provider";
import calendarMonthHeaderCss from "./CalendarMonthHeader.css";

/**
 * Props for the CalendarMonthHeader component.
 */
export interface CalendarMonthHeaderProps extends ComponentPropsWithRef<"div"> {
  /**
   * The month to show in the header.
   */
  month: DateFrameworkType;
  /**
   * The format of the month, passed to the date adapter's `format` method.
   * @default "MMMM"
   */
  format?: string;
}

const withBaseName = makePrefixer("saltCalendarMonthHeader");

export const CalendarMonthHeader = forwardRef<
  HTMLDivElement,
  CalendarMonthHeaderProps
>(function CalendarMonthHeader(props, ref) {
  const { className, format: formatMonthProp = "MMMM", month, ...rest } = props;
  const { dateAdapter } = useLocalization();

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-month-header",
    css: calendarMonthHeaderCss,
    window: targetWindow,
  });

  const formatMonth = useCallback(
    (date?: DateFrameworkType) => {
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
      <Text>{formatMonth(month)}</Text>
    </div>
  );
});
