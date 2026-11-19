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
import {
  type ComponentPropsWithRef,
  type FocusEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { useLocalization } from "../../localization-provider";
import { type DayStatus, useCalendarDay } from "../useCalendarDay";
import calendarDayCss from "./CalendarDay.css";

export interface CalendarDayProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  /**
   * Day date
   */
  date: DateFrameworkType;
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
  month: DateFrameworkType;
  /**
   * Additional Tooltip props
   */
  TooltipProps?: Partial<TooltipProps>;
}
export interface renderCalendarDayProps extends CalendarDayProps {
  /**
   * Status of day
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
      onClick,
      onFocus,
      onKeyDown,
      onMouseMove,
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

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      dayProps.onClick?.(event);
      onClick?.(event);
    };

    const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
      dayProps.onFocus?.(event);
      onFocus?.(event);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      dayProps.onKeyDown?.(event);
      onKeyDown?.(event);
    };

    const handleMouseMove: MouseEventHandler<HTMLButtonElement> = (event) => {
      dayProps.onMouseMove?.(event);
      onMouseMove?.(event);
    };

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
      onClick: handleClick,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
      onMouseMove: handleMouseMove,
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
