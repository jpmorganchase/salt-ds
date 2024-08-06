import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";
const localTimeZone = getLocalTimeZone();

export const OffsetSelection = (): ReactElement => (
  <Calendar
    selectionVariant="offset"
    endDateOffset={(date) => date.add({ days: 2 })}
    defaultSelectedDate={{
      startDate: today(localTimeZone).subtract({ days: 2 }),
      endDate: today(localTimeZone),
    }}
  >
    <CalendarNavigation />
  </Calendar>
);
