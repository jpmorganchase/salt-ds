import { type DateValue, getDayOfWeek } from "@internationalized/date";
import { Calendar, CalendarNavigation, getCurrentLocale } from "@salt-ds/lab";
import type { ReactElement } from "react";

const isDayDisabled = (date: DateValue) =>
  // Saturday & Sunday
  getDayOfWeek(date, getCurrentLocale()) >= 5;

export const DisabledDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayDisabled={isDayDisabled}>
    <CalendarNavigation />
  </Calendar>
);
