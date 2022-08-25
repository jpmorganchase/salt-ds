import {
  makePrefixer,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import { CloseIcon } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { ComponentPropsWithRef, forwardRef, ReactElement, useRef } from "react";
import { DateValue } from "@internationalized/date";

import { DayStatus, useCalendarDay } from "../useCalendarDay";
import "./CalendarDay.css";
import { formatDate } from "./utils";

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

const withBaseName = makePrefixer("uitkCalendarDay");

export const CalendarDay = forwardRef<HTMLButtonElement, CalendarDayProps>(
  function CalendarDay(props, ref) {
    const { className, day, renderDayContents, month, TooltipProps, ...rest } =
      props;

    const dayRef = useRef<HTMLButtonElement>(null);
    const { status, dayProps, unselectableReason } = useCalendarDay(
      {
        date: day,
        month,
      },
      dayRef
    );
    const { outOfRange, today, unselectable, hidden } = status;

    const { getTriggerProps, getTooltipProps } = useTooltip({
      disabled: !unselectableReason,
      placement: "top",
      enterDelay: 300,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<"button">({
      "aria-label": formatDate(day),
      ...dayProps,
      ...rest,
      className: cx(
        withBaseName(),
        {
          [withBaseName("hidden")]: hidden,
          [withBaseName("outOfRange")]: outOfRange,
          [withBaseName("today")]: today,
          [withBaseName("unselectable")]: !!unselectable,
          uitkEmphasisLow: unselectable === "low",
          uitkEmphasisMedium: unselectable === "medium",
        },
        dayProps.className,
        className
      ),
    });

    const handleTriggerRef = useForkRef(triggerRef, dayRef);
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
          {unselectable === "medium" && (
            <CloseIcon
              aria-hidden
              aria-label={undefined}
              className={withBaseName("blockedIcon")}
            />
          )}

          {renderDayContents
            ? renderDayContents(day, status)
            : formatDate(day, { day: "numeric" })}
        </button>
      </>
    );
  }
);
