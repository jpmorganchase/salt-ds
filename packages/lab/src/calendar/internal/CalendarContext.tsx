import { createContext, useContext } from "react";
import { useCalendar } from "../useCalendar";

interface CalendarState {
  state: ReturnType<typeof useCalendar>["state"];
  helpers: ReturnType<typeof useCalendar>["helpers"];
}

const CalendarContext = createContext<CalendarState | null>(null);

if (process.env.NODE_ENV !== "production") {
  CalendarContext.displayName = "CalendarContext";
}

function useCalendarContext(): CalendarState {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("Unexpected usage");
  }

  return context;
}

export { CalendarContext, useCalendarContext };
