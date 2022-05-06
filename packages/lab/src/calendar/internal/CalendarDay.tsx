import {
  forwardRef,
  ComponentPropsWithRef,
  ReactElement,
  useCallback,
} from "react";
import cx from "classnames";
import dayjs from "./dayjs";
import { useCalendarDay, DayStatus } from "../useCalendarDay";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import { useForkRef } from "../../utils";

import "./CalendarDay.css";
import { Tooltip, TooltipProps, useTooltip } from "../../tooltip";

export type DateFormatter = (day: Date) => string | undefined;

export interface CalendarDayProps
  extends Omit<ComponentPropsWithRef<"button">, "children"> {
  day: Date;
  formatDate?: DateFormatter;
  renderDayContents?: (date: Date, status: DayStatus) => ReactElement;
  status?: DayStatus;
  month: Date;
  TooltipProps?: Partial<TooltipProps>;
}

const withBaseName = makePrefixer("uitkCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  function CalendarDay(props, ref) {
    const { className, day, renderDayContents, month, TooltipProps, ...rest } =
      props;

    const { status, dayProps, registerDay, unselectableReason } =
      useCalendarDay({
        date: day,
        month,
      });

    const { outOfRange, today, unselectable, hidden } = status;

    const { getTriggerProps, getTooltipProps } = useTooltip({
      disabled: !unselectableReason,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<"button">({
      "aria-label": dayjs(day).format("dddd, LL"),
      ...dayProps,
      ...rest,
      className: cx(
        withBaseName(),
        {
          [withBaseName("hidden")]: hidden,
          [withBaseName("outOfRange")]: outOfRange,
          [withBaseName("unselectableHighEmphasis")]: unselectable === "high",
          [withBaseName("today")]: today,
          [withBaseName("unselectableLowEmphasis")]: unselectable === "low",
        },
        dayProps.className,
        className
      ),
    });

    const registerDayRef = useCallback(
      (node: HTMLButtonElement) => {
        registerDay(day, node);
      },
      [registerDay, day]
    );
    const handleTriggerRef = useForkRef(triggerRef, registerDayRef);
    const handleRef = useForkRef(handleTriggerRef, ref);

    return (
      <>
        <Tooltip
          {...getTooltipProps({
            hideIcon: true,
            state: "error",
            title: unselectableReason,
            ...TooltipProps,
          })}
        />
        <button {...triggerProps} ref={handleRef}>
          {unselectable === "high" && (
            <CloseIcon
              aria-hidden
              aria-label={undefined}
              className={withBaseName("blockedIcon")}
            />
          )}

          {renderDayContents
            ? renderDayContents(day, status)
            : dayjs(day).format("D")}
        </button>
      </>
    );
  }
);
