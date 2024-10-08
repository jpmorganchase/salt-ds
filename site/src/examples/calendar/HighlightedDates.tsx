import {
  type DateValue,
  isEqualDay,
  startOfMonth,
} from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

// Start of month
const isDayHighlighted = (date: DateValue) =>
  isEqualDay(startOfMonth(date), date) ? "Start of month reminder" : false;

export const HighlightedDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayHighlighted={isDayHighlighted}>
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
