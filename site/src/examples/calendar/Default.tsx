import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar } from "@salt-ds/lab";
import type { ReactElement } from "react";
const localTimeZone = getLocalTimeZone();

export const Default = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    defaultSelectedDate={today(localTimeZone)}
  />
);
