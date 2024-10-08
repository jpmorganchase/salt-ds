import { getLocalTimeZone, today } from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Offset = (): ReactElement => (
  <Calendar
    selectionVariant="offset"
    endDateOffset={(date) => date.add({ days: 2 })}
    defaultSelectedDate={{
      startDate: today(getLocalTimeZone()),
      endDate: today(getLocalTimeZone()).add({ days: 2 }),
    }}
  >
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid />
  </Calendar>
);
