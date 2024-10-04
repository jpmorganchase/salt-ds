import { type DateValue, getDayOfWeek } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

// Saturday & Sunday
const isDayUnselectable = (date: DateValue) =>
  getDayOfWeek(date, getCurrentLocale()) >= 5
    ? "Weekends are un-selectable"
    : false;

export const UnselectableDates = (): ReactElement => (
  <Calendar selectionVariant="single" isDayUnselectable={isDayUnselectable}>
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
