import { ComponentPropsWithRef, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { daysForLocale } from "./utils";

import calendarWeekHeaderCss from "./CalendarWeekHeader.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div">;

const withBaseName = makePrefixer("saltCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef<
  HTMLDivElement,
  CalendarWeekHeaderProps
>(function CalendarWeekHeader({ className, ...rest }, ref) {
  const weekdaysShort = daysForLocale("narrow");
  const weekdaysLong = daysForLocale("long");

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar",
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
          aria-hidden="true"
          key={weekdaysLong[index]}
          className={withBaseName("dayOfWeek")}
        >
          {day}
        </small>
      ))}
    </div>
  );
});
