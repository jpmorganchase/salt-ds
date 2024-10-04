import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
export const Range = (): ReactElement => (
  <Calendar
    selectionVariant="range"
    defaultSelectedDate={{
      startDate: today(getLocalTimeZone()).subtract({ days: 10 }),
      endDate: today(getLocalTimeZone()),
    }}
  >
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
