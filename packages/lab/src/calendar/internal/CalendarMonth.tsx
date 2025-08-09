import { makePrefixer } from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  forwardRef,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { useLocalization } from "../../localization-provider";
import { useCalendarContext } from "./CalendarContext";
import { CalendarDay, type CalendarDayProps } from "./CalendarDay";
import calendarMonthCss from "./CalendarMonth.css";
import { generateVisibleDays } from "./utils";

export interface CalendarMonthProps<TDate>
  extends ComponentPropsWithRef<"div"> {
  /**
   * Month to render as selectable dates
   */
  date: TDate;
  /**
   * Props for the CalendarDay component.
   */
  CalendarDayProps?: Partial<CalendarDayProps<TDate>>;
}

const chunkArray = (array: DateFrameworkType[], chunkSize: number) => {
  const result = [];
  for (let chunkIndex = 0; chunkIndex < array.length; chunkIndex += chunkSize) {
    result.push(array.slice(chunkIndex, chunkIndex + chunkSize));
  }
  return result;
};

const withBaseName = makePrefixer("saltCalendarMonth");

export const CalendarMonth = forwardRef<
  HTMLDivElement,
  CalendarMonthProps<DateFrameworkType>
>(function CalendarMonth<TDate extends DateFrameworkType>(
  props: CalendarMonthProps<TDate>,
  ref: React.Ref<HTMLDivElement>,
) {
  const { className, date, onMouseLeave, CalendarDayProps, ...rest } = props;
  const { dateAdapter } = useLocalization<TDate>();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-calendar-month",
    css: calendarMonthCss,
    window: targetWindow,
  });

  const {
    state: { selectionVariant, timezone = "default" },
    helpers: { setHoveredDate },
  } = useCalendarContext<TDate>();
  const days = generateVisibleDays<TDate>(dateAdapter, date, timezone);
  const handleMouseLeave = (event: SyntheticEvent) => {
    setHoveredDate(event, null);
    onMouseLeave?.(event as MouseEvent<HTMLDivElement>);
  };

  const weeks = chunkArray(days, 7);

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={ref}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <div
        data-testid="CalendarGrid"
        className={clsx(withBaseName("grid"), withBaseName(selectionVariant))}
      >
        {weeks.map((week, index) => (
          <div key={`row-${index}`} className={clsx(withBaseName("week"))}>
            {week.map((day: TDate) => (
              <CalendarDay
                {...CalendarDayProps}
                key={dateAdapter.format(day, "DD MMM YYYY")}
                date={day}
                month={date}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});
