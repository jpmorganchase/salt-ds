import { useCalendarContext } from "./internal/CalendarContext";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  ComponentPropsWithoutRef,
  RefObject,
  useEffect,
} from "react";
import { useSelectionDay } from "./internal/useSelection";
import { useFocusManagement } from "./internal/useFocusManagement";
import {
  DateValue,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  isToday,
} from "@internationalized/date";

export type DayStatus = {
  outOfRange?: boolean;
  selected?: boolean;
  today?: boolean;
  unselectable?: "high" | "low" | false;
  focused?: boolean;
  hidden?: boolean;
};

export interface useCalendarDayProps {
  date: DateValue;
  month: DateValue;
}

export function useCalendarDay(
  { date, month }: useCalendarDayProps,
  ref: RefObject<HTMLElement>
) {
  const {
    state: { focusedDate, hideOutOfRangeDates, calendarFocused },
    helpers: { isDayUnselectable, isOutsideAllowedMonths },
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

  const outOfRange = !isSameMonth(date, month);
  const focused =
    isSameDay(date, focusedDate) && calendarFocused && !outOfRange;
  const tabIndex = isSameDay(date, focusedDate) && !outOfRange ? 0 : -1;
  const today = isToday(date, getLocalTimeZone());

  const unselectableResult =
    isDayUnselectable(date) || (outOfRange && isOutsideAllowedMonths(date));
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

  useEffect(() => {
    if (focused) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [ref, focused]);

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
  };
}
