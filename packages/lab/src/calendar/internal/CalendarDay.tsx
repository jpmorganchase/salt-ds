import {
  makePrefixer,
  type RenderPropsType,
  renderProps,
  Tooltip,
  type TooltipProps,
  useForkRef,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, useLayoutEffect } from "react";
import { useLocalization } from "../../localization-provider";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";

export interface CalendarDayProps<TDate>
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  /**
   * Day date
   */
  date: TDate;
  /**
   * Format of date
   */
  format?: string;
  /**
   * Render prop to enable customisation of day button.
   */
  render?: RenderPropsType["render"];
  /**
   * Month being rendered
   */
  month: TDate;
  /**
   * Additional Tooltip props
   */
  TooltipProps?: Partial<TooltipProps>;
}
export interface renderCalendarDayProps<TDate> extends CalendarDayProps<TDate> {
  /**
   * Status of day
   */
  status: DayStatus;
}

const withBaseName = makePrefixer("saltCalendarDay");

export const CalendarDay = forwardRef<
  HTMLButtonElement,
  CalendarDayProps<DateFrameworkType>
>(function CalendarDay<TDate extends DateFrameworkType>(
  props: CalendarDayProps<TDate>,
  ref: React.Ref<HTMLButtonElement>,
) {
  const {
    className,
    date,
    render,
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

  const {
    status,
    focusedDateRef = null,
    dayProps,
    unselectableReason,
    highlightedReason,
  } = useCalendarDay({
    date,
    month,
  });
  const {
    focused,
    outOfRange,
    today,
    unselectable,
    highlighted,
    hidden,
    disabled,
  } = status;
  const buttonRef = useForkRef(ref, focusedDateRef);

  useLayoutEffect(() => {
    if (focused) {
      focusedDateRef?.current?.focus({ preventScroll: true });
    }
  }, [focused, focusedDateRef?.current?.focus]);

  const defaultButtonProps = {
    "aria-label": dateAdapter.format(date, "DD MMMM YYYY"),
    children: (
      <>
      {highlighted ? <div className={withBaseName("highlighted")}></div> : null}
      <span className={withBaseName("content")}>
        {dateAdapter.format(date, format)}
      </span>
      </>
    ),
    disabled,
    ...dayProps,
    ref: buttonRef,
    ...rest,
    className: clsx(
      withBaseName(),
      {
        [withBaseName("hidden")]: hidden,
        [withBaseName("outOfRange")]: outOfRange,
        [withBaseName("disabled")]: disabled,
        [withBaseName("unselectable")]: !!unselectable,
        [withBaseName("focused")]: !!focused,
        [withBaseName("today")]: today,
      },
      dayProps.className,
      className,
    ),
  };

  const defaultButtonElement = (
      <button type={"button"} {...defaultButtonProps} />
  );

  const buttonElement = render
    ? renderProps<React.ElementType<renderCalendarDayProps<TDate>>>("button", {
        render,
        ...defaultButtonProps,
        status,
        date,
      })
    : defaultButtonElement;

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
});
