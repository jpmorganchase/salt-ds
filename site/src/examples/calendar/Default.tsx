import { ReactElement } from "react";
import { Calendar } from "@salt-ds/lab";
import { getLocalTimeZone, today } from "@internationalized/date";
const localTimeZone = getLocalTimeZone();

export const Default = (): ReactElement => (
  <Calendar
    selectionVariant="default"
    defaultSelectedDate={today(localTimeZone)}
  />
);
