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
import { type DateFrameworkType, useLocalization } from "../../date-adapters";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";

export type DateFormatter = (day: Date) => string | undefined;

export interface CalendarDayProps<TDate>
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  day: TDate;
  format?: string;
  renderDayContents?: (date: TDate, status: DayStatus) => ReactElement;
  status?: DayStatus;
  month: TDate;
  TooltipProps?: Partial<TooltipProps>;
}

const withBaseName = makePrefixer("saltCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps<any>>(
  function CalendarDay<TDate extends DateFrameworkType>(
    props: CalendarDayProps<TDate>,
    ref: React.Ref<HTMLButtonElement>,
  ) {
    const {
      className,
      day,
      renderDayContents,
      month,
      TooltipProps,
      format = "DD",
      ...rest
    } = props;
    const { dateAdapter } = useLocalization<TDate>();
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-calendar-day",
      css: calendarDayCss,
      window: targetWindow,
    });

    const dayRef = useRef<HTMLButtonElement>(null);
    const buttonRef = useForkRef(ref, dayRef);
    const { status, dayProps, unselectableReason, highlightedReason } =
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
        aria-label={dateAdapter.format(day, "DD MMMM YYYY")}
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
            : dateAdapter.format(day, format)}
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
