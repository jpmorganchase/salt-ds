import {
  Tooltip,
  type TooltipProps,
  makePrefixer,
  useForkRef,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithRef,
  type ReactElement,
  forwardRef,
  useLayoutEffect,
} from "react";
import { useLocalization } from "../../localization-provider";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";

export interface CalendarDayProps<TDate>
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  day: TDate;
  format?: string;
  renderDayButton?: (
    date: TDate,
    props: ComponentPropsWithRef<"button">,
    status: DayStatus
  ) => ReactElement | null;
  status?: DayStatus;
  month: TDate;
  TooltipProps?: Partial<TooltipProps>;
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
    day,
    renderDayButton,
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
    date: day,
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

  const defaultButtonProps: ComponentPropsWithRef<"button"> = {
    "aria-label": dateAdapter.format(day, "DD MMMM YYYY"),
    disabled,
    type: "button",
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
        [withBaseName("highlighted")]: !!highlighted,
        [withBaseName("focused")]: !!focused,
        [withBaseName("today")]: today,
      },
      dayProps.className,
      className,
    ),
  };

  const defaultButtonElement = (
    <button {...defaultButtonProps}>
      <span
        className={withBaseName("content")}
      >
        {dateAdapter.format(day, format)}
      </span>
    </button>
  );

  const buttonElement = renderDayButton
    ? renderDayButton(day, defaultButtonProps, status)
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
