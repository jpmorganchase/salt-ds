import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Calendar,
  CalendarDateGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Single = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    defaultSelectedDate={today(getLocalTimeZone())}
  >
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarDateGrid />
  </Calendar>
);
