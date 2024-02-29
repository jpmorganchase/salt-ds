import {
  DateValue,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import {
  ComponentPropsWithoutRef,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  RefObject,
  useEffect,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import { useFocusManagement } from "./internal/useFocusManagement";
import { useSelectionDay } from "./useSelection";

export interface DayStatus {
  outOfRange?: boolean;
  selected?: boolean;
  today?: boolean;
  unselectable?: string | false;
  highlighted?: string | false;
  focused?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

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
    helpers: {
      isDayUnselectable,
      isDayHighlighted,
      isDayDisabled,
      isOutsideAllowedMonths,
    },
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

  const unselectableResult = isDayUnselectable(date);
  const unselectableReason =
    typeof unselectableResult !== "boolean" ? unselectableResult : ""; // TODO: check accessibility, should we have a default tooltip message?

  const highlightedResult = isDayHighlighted(date);
  const highlightedReason =
    typeof highlightedResult !== "boolean" ? highlightedResult : ""; // TODO: check accessibility, should we have a default tooltip message?

  const disabled =
    isDayDisabled(date) || (outOfRange && isOutsideAllowedMonths(date));
  const unselectable = Boolean(unselectableResult);
  const highlighted = Boolean(highlightedResult);
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
      disabled,
      highlighted,
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
    highlightedReason,
  };
}
