import { makePrefixer, Tooltip, TooltipProps, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { ComponentPropsWithRef, forwardRef, ReactElement, useRef } from "react";
import { DateValue } from "@internationalized/date";
import { DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";
import { formatDate } from "./utils";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

export type DateFormatter = (day: Date) => string | undefined;

export interface CalendarDayProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  day: DateValue;
  formatDate?: DateFormatter;
  renderDayContents?: (date: DateValue, status: DayStatus) => ReactElement;
  status?: DayStatus;
  month: DateValue;
  TooltipProps?: Partial<TooltipProps>;
}

const withBaseName = makePrefixer("saltCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  function CalendarDay(props, ref) {
    const { className, day, renderDayContents, month, TooltipProps, ...rest } =
      props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-day",
      css: calendarDayCss,
      window: targetWindow,
    });

    const dayRef = useRef<HTMLButtonElement>(null);
    const buttonRef = useForkRef(ref, dayRef);
    const { status, dayProps, unselectableReason } = useCalendarDay(
      {
        date: day,
        month,
      },
      dayRef
    );
    const { outOfRange, today, unselectable, hidden } = status;

    return (
      <Tooltip
        hideIcon
        status="error"
        content={unselectableReason || "Date is out of range"}
        disabled={!unselectableReason}
        placement="top"
        enterDelay={0} // --salt-duration-instant
        {...TooltipProps}
      >
        <button
          aria-label={formatDate(day)}
          {...dayProps}
          ref={buttonRef}
          {...rest}
          className={clsx(
            withBaseName(),
            {
              [withBaseName("hidden")]: hidden,
              [withBaseName("outOfRange")]: outOfRange,
              [withBaseName("unselectable")]: !!unselectable,
            },
            dayProps.className,
            className
          )}
        >
          <span
            className={clsx(withBaseName("content"), {
              [withBaseName("today")]: today,
            })}
          >
            {renderDayContents
              ? renderDayContents(day, status)
              : formatDate(day, { day: "numeric" })}
          </span>
        </button>
      </Tooltip>
    );
  }
);
