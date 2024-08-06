import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

const localTimeZone = getLocalTimeZone();

export const Single = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    defaultSelectedDate={today(localTimeZone)}
  >
    <CalendarNavigation />
  </Calendar>
);
