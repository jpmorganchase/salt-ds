import {
  makePrefixer,
  type RenderPropsType,
  renderProps,
  Tooltip,
  type TooltipProps,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef } from "react";
import { useLocalization } from "../../localization-provider";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";

export interface CalendarDayProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  /**
   * The date of the day.
   */
  date: DateFrameworkType;
  /**
   * The format of the day number, passed to the date adapter's `format` method.
   * @default "DD"
   */
  format?: string;
  /**
   * Render prop to enable customization of the day button.
   */
  render?: RenderPropsType["render"];
  /**
   * The month that the day is shown in. Days outside this month are shown as out of range.
   */
  month: DateFrameworkType;
  /**
   * Props applied to the `Tooltip` that shows why the day is unselectable or highlighted.
   */
  TooltipProps?: Partial<TooltipProps>;
}
export interface renderCalendarDayProps extends CalendarDayProps {
  /**
   * The status of the day, such as whether it's selected, today or unselectable.
   */
  status: DayStatus;
}

const withBaseName = makePrefixer("saltCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  function CalendarDay(
    props: CalendarDayProps,
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
    const { dateAdapter } = useLocalization();
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: ignore `focusedDateRef.current`
    useIsomorphicLayoutEffect(() => {
      if (focused) {
        focusedDateRef?.current?.focus({ preventScroll: true });
      }
    }, [focused]);

    const defaultButtonProps = {
      children: (
        <>
          {highlighted ? <div className={withBaseName("highlighted")} /> : null}
          <span aria-hidden={true} className={withBaseName("content")}>
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
      renderProps<React.ElementType<renderCalendarDayProps>>("button", {
        render,
        ...defaultButtonProps,
        status,
        date,
      })
    ) : (
      <button {...defaultButtonProps} />
    );

    const tooltipContent: string | false | undefined =
      unselectableReason || highlightedReason;
    if (tooltipContent && tooltipContent?.length > 0) {
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
  },
);
