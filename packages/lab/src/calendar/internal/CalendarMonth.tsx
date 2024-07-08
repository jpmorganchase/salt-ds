import type { DateValue } from "@internationalized/date";
import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type SyntheticEvent,
  forwardRef,
} from "react";
import { CalendarDay, type CalendarDayProps } from "./CalendarDay";
import { formatDate, generateVisibleDays } from "./utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { useCalendarContext } from "./CalendarContext";
import calendarMonthCss from "./CalendarMonth.css";

export interface CalendarMonthProps extends ComponentPropsWithRef<"div"> {
  date: DateValue;
  hideOutOfRangeDates?: boolean;
  renderDayContents?: CalendarDayProps["renderDayContents"];
  TooltipProps?: CalendarDayProps["TooltipProps"];
}

const withBaseName = makePrefixer("saltCalendarMonth");

export const CalendarMonth = forwardRef<HTMLDivElement, CalendarMonthProps>(
  function CalendarMonth(props, ref) {
    const {
      className,
      date,
      renderDayContents,
      onMouseLeave,
      TooltipProps,
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-month",
      css: calendarMonthCss,
      window: targetWindow,
    });

    const days = generateVisibleDays(date);
    const {
      helpers: { setHoveredDate },
    } = useCalendarContext();

    const handleMouseLeave = (event: SyntheticEvent) => {
      setHoveredDate(event, null);
      onMouseLeave?.(event as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <div
          data-testid="CalendarDateGrid"
          className={withBaseName("dateGrid")}
        >
          {days.map((day) => {
            return (
              <CalendarDay
                key={formatDate(day.date)}
                day={day.date}
                renderDayContents={renderDayContents}
                month={date}
                TooltipProps={TooltipProps}
              />
            );
          })}
        </div>
      </div>
    );
  },
);
