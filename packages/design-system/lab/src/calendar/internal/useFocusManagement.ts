import {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { useCalendarContext } from "./CalendarContext";
import { DateValue, endOfWeek, startOfWeek } from "@internationalized/date";
import { getCurrentLocale } from "./utils";

export function useFocusManagement({ date }: { date: DateValue }) {
  const {
    helpers: { setFocusedDate },
  } = useCalendarContext();
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setFocusedDate(event, date);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    let newDate = date;
    switch (event.key) {
      case "ArrowUp":
        newDate = date.subtract({ weeks: 1 });
        break;
      case "ArrowDown":
        newDate = date.add({ weeks: 1 });
        break;
      case "ArrowLeft":
        newDate = date.subtract({ days: 1 });
        break;
      case "ArrowRight":
        newDate = date.add({ days: 1 });
        break;
      case "Home":
        newDate = startOfWeek(date, getCurrentLocale());
        break;
      case "End":
        // @ts-ignore TODO bug in @internationalized/date
        newDate = endOfWeek(date, getCurrentLocale());
        break;
      case "PageUp":
        if (event.shiftKey) {
          newDate = date.subtract({ years: 1 });
        } else {
          newDate = date.subtract({ months: 1 });
        }
        break;
      case "PageDown":
        if (event.shiftKey) {
          newDate = date.add({ years: 1 });
        } else {
          newDate = date.add({ months: 1 });
        }
        break;
      default:
    }

    setFocusedDate(event, newDate);
  };

  const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
    setFocusedDate(event, date);
  };

  return {
    handleClick,
    handleKeyDown,
    handleFocus,
  };
}
