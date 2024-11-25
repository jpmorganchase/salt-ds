import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const HighlightedDates = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayHighlighted = (day: ReturnType<typeof dateAdapter.date>) => {
    const startOfMonth = dateAdapter.startOf(day, "month");
    return dateAdapter.isSame(startOfMonth, day, "day")
      ? "Start of month reminder"
      : false;
  };
  return (
    <Calendar selectionVariant="single" isDayHighlighted={isDayHighlighted}>
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};
