import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";
const localTimeZone = getLocalTimeZone();
export const MultiSelection = (): ReactElement => (
  <Calendar
    selectionVariant="multiselect"
    defaultSelectedDate={[
      today(localTimeZone),
      today(localTimeZone).subtract({ days: 1 }),
      today(localTimeZone).subtract({ days: 8 }),
    ]}
  />
);
