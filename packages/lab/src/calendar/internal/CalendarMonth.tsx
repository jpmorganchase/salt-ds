import {
  forwardRef,
  ComponentPropsWithRef,
  MouseEvent,
  SyntheticEvent,
} from "react";
import cx from "classnames";
import dayjs from "./dayjs";
import { CalendarDay, CalendarDayProps } from "./CalendarDay";
import { generateVisibleDays } from "./calendarUtils";
import { makePrefixer } from "@brandname/core";

import "./CalendarMonth.css";
import { useCalendarContext } from "./CalendarContext";

export interface CalendarMonthProps extends ComponentPropsWithRef<"div"> {
  date: Date;
  hideOutOfRangeDates?: boolean;
  renderDayContents?: CalendarDayProps["renderDayContents"];
  isVisible?: boolean;
  TooltipProps?: CalendarDayProps["TooltipProps"];
}

const withBaseName = makePrefixer("uitkCalendarMonth");

export const CalendarMonth = forwardRef<HTMLDivElement, CalendarMonthProps>(
  function CalendarMonth(props, ref) {
    const {
      className,
      date,
      hideOutOfRangeDates,
      isVisible,
      renderDayContents,
      onMouseLeave,
      TooltipProps,
      ...rest
    } = props;

    const month = dayjs(date).month();
    const year = dayjs(date).year();

    const days = generateVisibleDays(year, month);
    const {
      helpers: { setHoveredDate },
    } = useCalendarContext();

    const handleMouseLeave = (event: SyntheticEvent) => {
      setHoveredDate(event, null);
      onMouseLeave?.(event as MouseEvent<HTMLDivElement>);
    };

    return (
      <div
        className={cx(withBaseName(), className)}
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
                key={dayjs(day.date).format("L")}
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
