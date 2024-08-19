import { type DateValue, getDayOfWeek } from "@internationalized/date";
import { Calendar, CalendarNavigation, getCurrentLocale } from "@salt-ds/lab";
import type { ReactElement } from "react";

const isDayUnselectable = (date: DateValue) => {
  // Saturday & Sunday
  if (getDayOfWeek(date, getCurrentLocale()) >= 5) {
    return "weekend";
  }
};

export const UnselectableDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayUnselectable={isDayUnselectable}>
    <CalendarNavigation />
  </Calendar>
);
