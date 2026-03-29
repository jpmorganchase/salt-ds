import { createContext, useContext } from "react";
import type { UseCalendarReturn } from "../useCalendar";

export interface CalendarState extends UseCalendarReturn {}

const CalendarContext = createContext<CalendarState | null>(null);

if (process.env.NODE_ENV !== "production") {
  CalendarContext.displayName = "CalendarContext";
}

function useCalendarContext(): CalendarState {
  const context = useContext(
    CalendarContext as React.Context<CalendarState | null>,
  );
  if (!context) {
    throw new Error(
      "useCalendarContext should be called inside CalendarContext.Provider",
    );
  }

  return context;
}

export { CalendarContext, useCalendarContext };
