import { Calendar, CalendarGrid, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const HideOutOfRangeDates = (): ReactElement => (
  <Calendar selectionVariant="single" hideOutOfRangeDates>
    <CalendarNavigation />
    <CalendarGrid />
  </Calendar>
);
