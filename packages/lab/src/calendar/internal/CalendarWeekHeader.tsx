import { forwardRef, ComponentPropsWithRef } from "react";
import cx from "classnames";
import { makePrefixer } from "@salt-ds/core";
import { daysForLocale } from "./utils";

import "./CalendarWeekHeader.css";

export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div">;

const withBaseName = makePrefixer("saltCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef<
  HTMLDivElement,
  CalendarWeekHeaderProps
>(function CalendarWeekHeader({ className, ...rest }, ref) {
  const weekdaysShort = daysForLocale("narrow");
  const weekdaysLong = daysForLocale("long");

  return (
    <div
      data-testid="CalendarWeekHeader"
      className={cx(withBaseName(), className)}
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
