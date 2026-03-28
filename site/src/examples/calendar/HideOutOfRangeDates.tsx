import { Calendar, CalendarGrid, CalendarNavigation } from "@salt-ds/date-components";
import type { ReactElement } from "react";

export const HideOutOfRangeDates = (): ReactElement => (
  <Calendar selectionVariant="single" hideOutOfRangeDates>
    <CalendarNavigation />
    <CalendarGrid />
  </Calendar>
);
