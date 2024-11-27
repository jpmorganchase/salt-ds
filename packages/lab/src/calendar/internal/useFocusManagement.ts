import type {
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { type DateFrameworkType, useLocalization } from "../../date-adapters";
import { useCalendarContext } from "./CalendarContext";

export function useFocusManagement<TDate extends DateFrameworkType>({
  date,
}: {
  date: TDate;
}) {
  const { dateAdapter } = useLocalization<TDate>();
  const {
    state: { locale },
    helpers: { setFocusedDate },
  } = useCalendarContext<TDate>();
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    setFocusedDate(event, date);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    let newDate = date;
    switch (event.key) {
      case "ArrowUp":
        newDate = dateAdapter.subtract(date, { weeks: 1 });
        break;
      case "ArrowDown":
        newDate = dateAdapter.add(date, { weeks: 1 });
        break;
      case "ArrowLeft":
        newDate = dateAdapter.subtract(date, { days: 1 });
        break;
      case "ArrowRight":
        newDate = dateAdapter.add(date, { days: 1 });
        break;
      case "Home":
        newDate = dateAdapter.startOf(date, "week", locale);
        break;
      case "End":
        newDate = dateAdapter.endOf(date, "week", locale);
        break;
      case "PageUp":
        if (event.shiftKey) {
          newDate = dateAdapter.subtract(date, { years: 1 });
        } else {
          newDate = dateAdapter.subtract(date, { months: 1 });
        }
        break;
      case "PageDown":
        if (event.shiftKey) {
          newDate = dateAdapter.add(date, { years: 1 });
        } else {
          newDate = dateAdapter.add(date, { months: 1 });
        }
        break;
      default:
    }
    if (dateAdapter.compare(newDate, date) !== 0) {
      event.preventDefault();
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
