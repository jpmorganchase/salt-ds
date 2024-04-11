import {
  ComponentPropsWithRef,
  forwardRef,
  MouseEvent,
  SyntheticEvent,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { DateValue } from "@internationalized/date";
import { CalendarDay, CalendarDayProps } from "./CalendarDay";
import { formatDate, generateVisibleDays } from "./utils";

import calendarMonthCss from "./CalendarMonth.css";
import { useCalendarContext } from "./CalendarContext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export interface CalendarMonthProps extends ComponentPropsWithRef<"div"> {
  date: DateValue;
  hideOutOfRangeDates?: boolean;
  renderDayContents?: CalendarDayProps["renderDayContents"];
  isVisible?: boolean;
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
  }
);
