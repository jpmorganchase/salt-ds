import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";
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
