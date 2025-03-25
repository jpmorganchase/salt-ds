import type { DateFrameworkType } from "@salt-ds/date-adapters";
import { createContext, useContext } from "react";
import type { UseCalendarReturn } from "../useCalendar";

interface CalendarState<TDate extends DateFrameworkType>
  extends UseCalendarReturn<TDate> {}

const CalendarContext = createContext<CalendarState<DateFrameworkType> | null>(
  null,
);

if (process.env.NODE_ENV !== "production") {
  CalendarContext.displayName = "CalendarContext";
}

function useCalendarContext<
  TDate extends DateFrameworkType,
>(): CalendarState<TDate> {
  const context = useContext(
    CalendarContext as React.Context<CalendarState<TDate> | null>,
  );
  if (!context) {
    throw new Error(
      "useCalendarContext should be called inside CalendarContext.Provider",
    );
  }

  return context;
}

export { CalendarContext, useCalendarContext };
