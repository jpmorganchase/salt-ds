import {
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import {
  Calendar,
  CalendarDateGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const MinMaxDate = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    defaultSelectedDate={today(getLocalTimeZone())}
    minDate={startOfMonth(today(getLocalTimeZone()))}
    maxDate={endOfMonth(today(getLocalTimeZone()))}
  >
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarDateGrid />
  </Calendar>
);
