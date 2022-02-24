import dayjs from "./internal/dayjs";
import { useCalendarContext } from "./internal/CalendarContext";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  ComponentPropsWithoutRef,
} from "react";
import { useSelectionDay } from "./internal/useSelection";
import { useFocusManagement } from "./internal/useFocusManagement";

export type DayStatus = {
  outOfRange?: boolean;
  selected?: boolean;
  today?: boolean;
  unselectable?: "high" | "low" | false;
  focused?: boolean;
  hidden?: boolean;
};

export interface useCalendarDayProps {
  date: Date;
  month: Date;
}

export function useCalendarDay({ date, month }: useCalendarDayProps) {
  const {
    state: { focusedDate, hideOutOfRangeDates },
    helpers: { isDayUnselectable, registerDayRef, isDateNavigable },
  } = useCalendarContext();
  const selectionManager = useSelectionDay({ date });
  const focusManager = useFocusManagement({ date });

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    selectionManager?.handleClick(event);
    focusManager.handleClick(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    focusManager.handleKeyDown(event);
    selectionManager?.handleKeyDown(event);
  };

  const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    focusManager.handleFocus(event);
  };

  const handleMouseOver: MouseEventHandler<HTMLButtonElement> = (event) => {
    selectionManager.handleMouseOver?.(event);
  };

  const eventHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onMouseOver: handleMouseOver,
  };

  const focused = dayjs(date).isSame(focusedDate, "day");
  const outOfRange = !dayjs(date).isSame(month, "month");
  const tabIndex = focused && !outOfRange ? 0 : -1;
  const today = dayjs().isSame(date, "day");

  const registerDay = (day: Date, element: HTMLElement) => {
    if (!outOfRange) {
      registerDayRef(date, element);
    }
  };

  const unselectableResult =
    isDayUnselectable(date) || (outOfRange && !isDateNavigable(date, "month"));
  const unselectableReason =
    typeof unselectableResult !== "boolean" &&
    unselectableResult.emphasis === "high"
      ? unselectableResult?.tooltip
      : "";
  const unselectable =
    typeof unselectableResult !== "boolean"
      ? unselectableResult.emphasis
      : unselectableResult
      ? "low"
      : false;
  const hidden = hideOutOfRangeDates && outOfRange;

  return {
    status: {
      outOfRange,
      today,
      unselectable,
      focused,
      hidden,
      ...selectionManager.status,
    } as DayStatus,
    dayProps: {
      tabIndex,
      "aria-current": today ? "date" : undefined,
      "aria-hidden": hidden ? "true" : undefined,
      ...eventHandlers,
      ...selectionManager.dayProps,
    } as ComponentPropsWithoutRef<"button">,
    unselectableReason,
    registerDay,
  };
}
