import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
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
    <CalendarGrid />
  </Calendar>
);
