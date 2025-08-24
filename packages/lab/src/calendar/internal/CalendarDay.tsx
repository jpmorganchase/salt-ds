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
  const { focused, today, unselectable, highlighted, hidden, outOfRange } =
    status;
  const buttonRef = useForkRef(ref, focusedDateRef);

  useLayoutEffect(() => {
    if (focused) {
      focusedDateRef?.current?.focus({ preventScroll: true });
    }
  }, [focused]);

  const defaultButtonProps = {
    "aria-label": dateAdapter.format(date, "DD MMMM YYYY"),
    children: (
      <>
        {highlighted ? <div className={withBaseName("highlighted")} /> : null}
        <span className={withBaseName("content")}>
          {dateAdapter.format(date, format)}
        </span>
      </>
    ),
    ...dayProps,
    ref: buttonRef,
    ...rest,
    className: clsx(
      withBaseName(),
      {
        [withBaseName("hidden")]: hidden,
        [withBaseName("unselectable")]: !!unselectable,
        [withBaseName("outOfRange")]: outOfRange,
        [withBaseName("focused")]: !!focused,
        [withBaseName("today")]: today,
      },
      dayProps.className,
      className,
    ),
  };

  const buttonElement = render ? (
    renderProps<React.ElementType<renderCalendarDayProps<TDate>>>("button", {
      render,
      ...defaultButtonProps,
      status,
      date,
    })
  ) : (
    <button type={"button"} {...defaultButtonProps} />
  );

  const tooltipContent = unselectableReason || highlightedReason;
  if (tooltipContent && tooltipContent?.length) {
    return (
      <Tooltip
        hideIcon
        status="info"
        content={tooltipContent}
        placement="top"
        enterDelay={0} // --salt-duration-instant
        leaveDelay={0} // --salt-duration-instant
        {...TooltipProps}
      >
        {buttonElement}
      </Tooltip>
    );
  }
  return buttonElement;
});
