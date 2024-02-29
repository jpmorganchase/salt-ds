import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";
import { getLocalTimeZone, today } from "@internationalized/date";
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
