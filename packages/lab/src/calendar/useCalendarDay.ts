import type { DateFrameworkType } from "@salt-ds/date-adapters";
import type {
  ComponentPropsWithoutRef,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { useRef } from "react";
import { useLocalization } from "../localization-provider";
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
   * If `true`, the day is selectable but outside of current month.
   */
  outsideCurrentMonth?: boolean;
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
 * @template TDate - The type of the date object.
 */
export interface useCalendarDayProps<TDate> {
  /**
   * The date of the calendar day.
   */
  date: TDate;
  /**
   * The month of the calendar day.
   */
  month: TDate;
}

export function useCalendarDay<TDate extends DateFrameworkType>(
  props: useCalendarDayProps<TDate>,
) {
  const { date, month } = props;
  const { dateAdapter } = useLocalization<TDate>();
  const {
    state: {
      focusedDate,
      focusedDateRef,
      hideOutOfRangeDates,
      timezone,
      focusableDates,
    },
    helpers: {
      setHoveredDate,
      isDayUnselectable,
      isDaySelectable,
      isDayHighlighted,
      isOutsideAllowedMonths,
    },
  } = useCalendarContext<TDate>();
  const selectionManager = useCalendarSelectionDay<TDate>({ date });
  const focusManager = useFocusManagement<TDate>({ date });
  const focusTriggeredByClick = useRef(false);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    selectionManager?.handleClick(event);
    focusManager.handleClick(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    focusTriggeredByClick.current = false;
    focusManager.handleKeyDown(event);
    selectionManager?.handleKeyDown(event);
  };

  const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    if (!focusTriggeredByClick.current) {
      focusManager.handleFocus(event);
    }
    setHoveredDate(event, date);
  };

  const handleMouseMove: MouseEventHandler<HTMLButtonElement> = (event) => {
    setHoveredDate(event, date);
  };

  const handleMouseDown: MouseEventHandler<HTMLButtonElement> = () => {
    focusTriggeredByClick.current = true;
  };

  const eventHandlers = {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onMouseMove: handleMouseMove,
    onMouseDown: handleMouseDown,
  };

  const focused = focusedDate && dateAdapter.isSame(date, focusedDate, "day");
  const tabIndex = focusableDates.find((tabbableDate) =>
    dateAdapter.isSame(date, tabbableDate, "day"),
  )
    ? 0
    : -1;
  const today = dateAdapter.isSame(dateAdapter.today(timezone), date, "day");

  const unselectableReason = isDayUnselectable(date);
  const highlightedReason = isDayHighlighted(date);

  const outsideCurrentMonth = !dateAdapter.isSame(date, month, "month");
  const disabled = isDaySelectable && !isDaySelectable(date);
  const unselectable =
    Boolean(unselectableReason) || isOutsideAllowedMonths(date);
  const highlighted = Boolean(highlightedReason);
  const hidden = hideOutOfRangeDates ? outsideCurrentMonth : false;

  return {
    status: {
      outsideCurrentMonth,
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
    focusedDateRef: focused ? focusedDateRef : null,
    unselectableReason,
    highlightedReason,
  };
}
