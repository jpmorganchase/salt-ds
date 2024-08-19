import {
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const MinMaxDate = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    minDate={startOfMonth(today(getLocalTimeZone()))}
    maxDate={endOfMonth(today(getLocalTimeZone()))}
  >
    <CalendarNavigation />
  </Calendar>
);
