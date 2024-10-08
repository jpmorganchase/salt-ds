import { type DateValue, getDayOfWeek } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  defaultLocale,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

// Saturday & Sunday
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, defaultLocale) >= 5 ? "Weekends are disabled" : false;

export const DisabledDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayDisabled={isDayDisabled}>
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
