import {
  type DateValue,
  isSameDay,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type RefObject,
  useEffect,
} from "react";
import { useCalendarContext } from "./internal/CalendarContext";
import { useFocusManagement } from "./internal/useFocusManagement";
import { useCalendarSelectionDay } from "./useCalendarSelection";

/**
 * Interface representing the status of a day in the Calendar.
 */
export interface DayStatus {
  /**
   * If `true`, the day is out of the selectable range.
   */
  outOfRange?: boolean;
  /**
   * If `true`, the day is selected.
   */
  selected?: boolean;
  /**
   * If `true`, the day is today.
   */
  today?: boolean;
  /**
   * If set, the day is unselectable with a reason.
   */
  unselectable?: string | false;
  /**
   * If set, the day is highlighted with a reason.
   */
  highlighted?: string | false;
  /**
   * If `true`, the day is focused.
   */
  focused?: boolean;
  /**
   * If `true`, the day is disabled.
   */
  disabled?: boolean;
  /**
   * If `true`, the day is hidden.
   */
  hidden?: boolean;
}

/**
 * UseCalendar hook props to return a calendar day's status
 */
export interface useCalendarDayProps {
  /**
   * The date of the calendar day.
   */
  date: DateValue;
  /**
   * The month of the calendar day.
   */
  month: DateValue;
}

export function useCalendarDay(
  { date, month }: useCalendarDayProps,
  ref: RefObject<HTMLElement>,
) {
  const {
    state: {
      focusedDate,
      hideOutOfRangeDates,
      calendarFocused,
      locale,
      timeZone,
    },
    helpers: {
      isDayUnselectable,
      isDaySelectable,
      isDayHighlighted,
      isDayDisabled,
      isOutsideAllowedMonths,
    },
  } = useCalendarContext();
  const selectionManager = useCalendarSelectionDay({ date });
  const focusManager = useFocusManagement({ date, locale });

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
    focusedDate &&
    isSameDay(date, focusedDate) &&
    calendarFocused &&
    !outOfRange;
  const tabIndex =
    focusedDate && isSameDay(date, focusedDate) && !outOfRange ? 0 : -1;
  const today = isToday(date, timeZone);

  const unselectableReason = isDayUnselectable(date) || isDayDisabled(date);
  const highlightedReason = isDayHighlighted(date);

  const disabled =
    isDayDisabled(date) ||
    (outOfRange && isOutsideAllowedMonths(date)) ||
    (isDaySelectable && !isDaySelectable(date));
  const unselectable = Boolean(unselectableReason);
  const highlighted = Boolean(highlightedReason);
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
    locale,
    timeZone,
  };
}
