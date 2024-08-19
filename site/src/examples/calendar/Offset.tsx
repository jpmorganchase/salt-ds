import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Offset = (): ReactElement => (
  <Calendar
    selectionVariant="offset"
    endDateOffset={(date) => date.add({ days: 2 })}
    defaultSelectedDate={{
      startDate: today(getLocalTimeZone()).subtract({ days: 2 }),
      endDate: today(getLocalTimeZone()),
    }}
  >
    <CalendarNavigation />
  </Calendar>
);
