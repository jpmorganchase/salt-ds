import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { daysOfWeek } from "./internal/utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type DateFrameworkType, useLocalization } from "../date-adapters";
import calendarWeekHeaderCss from "./CalendarWeekHeader.css";
import { useCalendarContext } from "./internal/CalendarContext";

/**
 * Props for the CalendarWeekHeader component.
 */
export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div"> & {};

const withBaseName = makePrefixer("saltCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef(function CalendarWeekHeader<
  TDate extends DateFrameworkType,
>(props: CalendarWeekHeaderProps, ref: React.Ref<HTMLDivElement>) {
  const { className, ...rest } = props;
  const { dateAdapter } = useLocalization<TDate>();
  const {
    state: { locale },
  } = useCalendarContext<TDate>();

  const weekdaysShort = daysOfWeek(dateAdapter, "narrow", locale);
  const weekdaysLong = daysOfWeek(dateAdapter, "long", locale);

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-week-header",
    css: calendarWeekHeaderCss,
    window: targetWindow,
  });

  return (
    <div
      data-testid="CalendarWeekHeader"
      className={clsx(withBaseName(), className)}
      ref={ref}
      {...rest}
    >
      {weekdaysShort.map((day, index) => (
        <small
          aria-hidden
          key={weekdaysLong[index]}
          className={withBaseName("dayOfWeek")}
        >
          {day}
        </small>
      ))}
    </div>
  );
});
