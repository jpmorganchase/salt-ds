import { makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type SyntheticEvent,
  forwardRef,
} from "react";
import { CalendarDay, type CalendarDayProps } from "./CalendarDay";
import { generateVisibleDays } from "./utils";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type DateFrameworkType, useLocalization } from "../../date-adapters";
import { useCalendarContext } from "./CalendarContext";
import calendarMonthCss from "./CalendarMonth.css";

export interface CalendarMonthProps<TDate>
  extends ComponentPropsWithRef<"div"> {
  /**
   * Month to render as selectable dates
   */
  date: TDate;
  /**
   * Function to render the contents of a day.
   */
  renderDayContents?: CalendarDayProps<TDate>["renderDayContents"];
  /**
   * Props for the tooltip component.
   */
  TooltipProps?: CalendarDayProps<TDate>["TooltipProps"];
}

const withBaseName = makePrefixer("saltCalendarMonth");

export const CalendarMonth = forwardRef<
  HTMLDivElement,
  CalendarMonthProps<any>
>(function CalendarMonth<TDate extends DateFrameworkType>(
  props: CalendarMonthProps<TDate>,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    className,
    date,
    renderDayContents,
    onMouseLeave,
    TooltipProps,
    ...rest
  } = props;
  const { dateAdapter } = useLocalization<TDate>();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-month",
    css: calendarMonthCss,
    window: targetWindow,
  });

  const {
    state: { locale },
    helpers: { setHoveredDate },
  } = useCalendarContext<TDate>();
  const days = generateVisibleDays<TDate>(dateAdapter, date, locale);
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
      <div data-testid="CalendarGrid" className={withBaseName("grid")}>
        {days.map((day) => {
          return (
            <CalendarDay
              key={dateAdapter.format(day.date, "DD MMM YYYY", locale)}
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
});
