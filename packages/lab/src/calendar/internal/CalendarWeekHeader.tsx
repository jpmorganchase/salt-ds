import { forwardRef, ComponentPropsWithRef } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import "./CalendarWeekHeader.css";
import { daysForLocale } from "./utils";

export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div">;

const withBaseName = makePrefixer("uitkCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef<
  HTMLDivElement,
  CalendarWeekHeaderProps
>(function CalendarWeekHeader({ className, ...rest }, ref) {
  const weekdaysShort = daysForLocale("narrow");
  const weekdaysLong = daysForLocale("long");

  return (
    <div
      data-testid="CalendarWeekHeader"
      className={cx("uitkEmphasisHigh", withBaseName(), className)}
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
