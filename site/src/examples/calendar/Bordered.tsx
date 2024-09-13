import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => (
  <Calendar
    selectionVariant="single"
    defaultSelectedDate={today(getLocalTimeZone())}
  >
    <CalendarNavigation
      MonthDropdownProps={{ bordered: true }}
      YearDropdownProps={{ bordered: true }}
    />
  </Calendar>
);
