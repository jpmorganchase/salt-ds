import type { DateValue } from "@internationalized/date";
import {
  Tooltip,
  type TooltipProps,
  makePrefixer,
  useForkRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type ReactElement,
  forwardRef,
  useRef,
} from "react";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";
import { formatDate as defaultFormatDate } from "./utils";

export type DateFormatter = (day: Date) => string | undefined;

export interface CalendarDayProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  day: DateValue;
  formatDate?: typeof defaultFormatDate;
  renderDayContents?: (date: DateValue, status: DayStatus) => ReactElement;
  status?: DayStatus;
  month: DateValue;
  TooltipProps?: Partial<TooltipProps>;
}

const withBaseName = makePrefixer("saltCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  function CalendarDay(props, ref) {
    const {
      className,
      day,
      renderDayContents,
      month,
      TooltipProps,
      formatDate: formatDateProp = defaultFormatDate,
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-day",
      css: calendarDayCss,
      window: targetWindow,
    });

    const dayRef = useRef<HTMLButtonElement>(null);
    const buttonRef = useForkRef(ref, dayRef);
    const { status, dayProps, unselectableReason, highlightedReason, locale } =
      useCalendarDay(
        {
          date: day,
          month,
        },
        dayRef,
      );
    const { outOfRange, today, unselectable, highlighted, hidden, disabled } =
      status;

    const buttonElement = (
      <button
        aria-label={formatDateProp(day, locale, {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
        disabled={disabled}
        type="button"
        {...dayProps}
        ref={buttonRef}
        {...rest}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("hidden")]: hidden,
            [withBaseName("outOfRange")]: outOfRange,
            [withBaseName("disabled")]: disabled,
            [withBaseName("unselectable")]: !!unselectable,
            [withBaseName("highlighted")]: !!highlighted,
          },
          dayProps.className,
          className,
        )}
      >
        <span
          className={clsx(withBaseName("content"), {
            [withBaseName("today")]: today,
          })}
        >
          {renderDayContents
            ? renderDayContents(day, status)
            : formatDateProp(day, locale, { day: "numeric" })}
        </span>
      </button>
    );
    const hasTooltip = unselectableReason || highlightedReason;
    if (!hasTooltip) {
      return buttonElement;
    }
    return (
      <Tooltip
        hideIcon
        status={unselectableReason ? "error" : "info"}
        content={
          unselectableReason || highlightedReason || "Date is out of range"
        }
        placement="top"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
        {...TooltipProps}
      >
        {buttonElement}
      </Tooltip>
    );
  },
);
