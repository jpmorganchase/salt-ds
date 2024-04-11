import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";
import { getLocalTimeZone, today } from "@internationalized/date";
const localTimeZone = getLocalTimeZone();

export const OffsetSelection = (): ReactElement => (
  <Calendar
    selectionVariant="offset"
    endDateOffset={(date) => date.add({ days: 2 })}
    defaultSelectedDate={{
      startDate: today(localTimeZone).subtract({ days: 2 }),
      endDate: today(localTimeZone),
    }}
  />
);
