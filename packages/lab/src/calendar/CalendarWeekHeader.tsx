import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { daysForLocale } from "./internal/utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import calendarWeekHeaderCss from "./CalendarWeekHeader.css";
import { getCurrentLocale } from "./formatDate";
import { useCalendarContext } from "./internal/CalendarContext";

export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div"> & {};

const withBaseName = makePrefixer("saltCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef<
  HTMLDivElement,
  CalendarWeekHeaderProps
>(function CalendarWeekHeader({ className, ...rest }, ref) {
  const {
    state: { locale },
  } = useCalendarContext();

  const weekdaysShort = daysForLocale("narrow", locale);
  const weekdaysLong = daysForLocale("long", locale);

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
