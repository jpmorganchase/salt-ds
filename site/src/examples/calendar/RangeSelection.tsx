import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";
import { getLocalTimeZone, today } from "@internationalized/date";
const localTimeZone = getLocalTimeZone();
export const RangeSelection = (): ReactElement => (
  <Calendar
    selectionVariant="range"
    defaultSelectedDate={{
      startDate: today(localTimeZone).subtract({ days: 10 }),
      endDate: today(localTimeZone),
    }}
  />
);
