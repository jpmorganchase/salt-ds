import { type DateValue, getDayOfWeek } from "@internationalized/date";
import { Calendar, CalendarNavigation, getCurrentLocale } from "@salt-ds/lab";
import type { ReactElement } from "react";

// Saturday & Sunday
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, getCurrentLocale()) >= 5 ? "Weekends are disabled" : false;

export const DisabledDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayDisabled={isDayDisabled}>
    <CalendarNavigation />
  </Calendar>
);
