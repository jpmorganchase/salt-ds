import {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { useCalendarContext } from "./CalendarContext";
import dayjs from "./dayjs";

interface useFocusManagementProps {
  date: Date;
}

export function useFocusManagement({ date }: useFocusManagementProps) {
  const {
    state: { focusedDate },
    helpers: { setFocusedDate },
  } = useCalendarContext();
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setFocusedDate(event, date);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    let newDate = date;
    switch (event.key) {
      case "ArrowUp":
        newDate = dayjs(date).subtract(1, "week").toDate();
        break;
      case "ArrowDown":
        newDate = dayjs(date).add(1, "week").toDate();
        break;
      case "ArrowLeft":
        newDate = dayjs(date).subtract(1, "day").toDate();
        break;
      case "ArrowRight":
        newDate = dayjs(date).add(1, "day").toDate();
        break;
      case "Home":
        newDate = dayjs(date).startOf("week").toDate();
        break;
      case "End":
        newDate = dayjs(date).endOf("week").toDate();
        break;
      case "PageUp":
        if (event.shiftKey) {
          newDate = dayjs(date).subtract(1, "year").toDate();
        } else {
          newDate = dayjs(date).subtract(1, "month").toDate();
        }
        break;
      case "PageDown":
        if (event.shiftKey) {
          newDate = dayjs(date).add(1, "year").toDate();
        } else {
          newDate = dayjs(date).add(1, "month").toDate();
        }
        break;
      default:
    }
    setFocusedDate(event, newDate);
  };

  const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    if (!dayjs(date).isSame(focusedDate, "day")) {
      setFocusedDate(event, date);
    }
  };

  return {
    handleClick,
    handleKeyDown,
    handleFocus,
  };
}
