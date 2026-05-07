import { makePrefixer, Text } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { useLocalization } from "../localization-provider";
import calendarWeekHeaderCss from "./CalendarWeekHeader.css";
import { daysOfWeek } from "./internal/utils";

/**
 * Props for the CalendarWeekHeader component.
 */
export type CalendarWeekHeaderProps = ComponentPropsWithRef<"div"> & {};

const withBaseName = makePrefixer("saltCalendarWeekHeader");

export const CalendarWeekHeader = forwardRef(function CalendarWeekHeader(
  props: CalendarWeekHeaderProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const { className, ...rest } = props;
  const { dateAdapter } = useLocalization();

  const weekdaysShort = daysOfWeek(dateAdapter, "narrow");
  const weekdaysLong = daysOfWeek(dateAdapter, "long");

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
        <Text
          aria-hidden
          key={weekdaysLong[index]}
          className={withBaseName("dayOfWeek")}
        >
          {day}
        </Text>
      ))}
    </div>
  );
});
