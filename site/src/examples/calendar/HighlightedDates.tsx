import {
  type DateValue,
  isEqualDay,
  startOfMonth,
} from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

const isDayHighlighted = (date: DateValue) => {
  // Start of month
  if (isEqualDay(startOfMonth(date), date)) {
    return "Start of month reminder";
  }
};

export const HighlightedDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayHighlighted={isDayHighlighted}>
    <CalendarNavigation />
  </Calendar>
);
