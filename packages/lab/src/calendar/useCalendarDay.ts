import type { DateFrameworkType } from "@salt-ds/date-adapters";
import type {
  ComponentPropsWithoutRef,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { useLocalization } from "../localization-provider";
import { useCalendarContext } from "./internal/CalendarContext";
import { useFocusManagement } from "./internal/useFocusManagement";
import { useCalendarSelectionDay } from "./useCalendarSelection";

/**
 * Interface representing the status of a day in the Calendar.
 */
export interface DayStatus {
  /**
   * If `true`, the day is selectable but outside of current month.
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
  date: DateFrameworkType;
  /**
   * The month of the calendar day.
   */
  month: DateFrameworkType;
}

export function useCalendarDay(props: useCalendarDayProps) {
  const { date, month } = props;
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const state = useCalendarContext();
  const {
    state: {
      focusedDate,
      focusedDateRef,
      hideOutOfRangeDates,
      timezone,
      focusableDate,
    },
    helpers: {
      setHoveredDate,
      isDayUnselectable,
      isDayHighlighted,
      isOutsideAllowedMonths,
      isOutsideAllowedDates,
    },
  } = state;
  const selectionManager = useCalendarSelectionDay({ date });
  const focusManager = useFocusManagement({ date });

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    selectionManager.handleClick(event);
    focusManager.handleClick(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    focusManager.handleKeyDown(event);
    selectionManager.handleKeyDown(event);
  };

  const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    focusManager.handleFocus(event);
    setHoveredDate(event, date);
  };

  const handleMouseMove: MouseEventHandler<HTMLButtonElement> = (event) => {
    setHoveredDate(event, date);
  };

  const eventHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onMouseMove: handleMouseMove,
  };

  const focused = focusedDate && dateAdapter.isSame(date, focusedDate, "day");
  const tabIndex =
    focusableDate && dateAdapter.isSame(date, focusableDate, "day") ? 0 : -1;
  const today = dateAdapter.isSame(dateAdapter.today(timezone), date, "day");

  const unselectableReason = isDayUnselectable(date);
  const highlightedReason = isDayHighlighted(date);

  const outOfRange = !dateAdapter.isSame(date, month, "month");
  const unselectable =
    Boolean(unselectableReason) ||
    !!isOutsideAllowedMonths(date) ||
    !!isOutsideAllowedDates(date);
  const highlighted = Boolean(highlightedReason);
  const hidden = hideOutOfRangeDates ? outOfRange : false;

  return {
    status: {
      outOfRange,
      today,
      unselectable,
      focused,
      hidden,
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
    focusedDateRef: focused ? focusedDateRef : null,
    unselectableReason,
    highlightedReason,
  };
}
