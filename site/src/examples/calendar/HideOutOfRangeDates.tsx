import {
  Calendar,
  CalendarDateGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const HideOutOfRangeDates = (): ReactElement => (
  <Calendar selectionVariant="single" hideOutOfRangeDates>
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarDateGrid />
  </Calendar>
);
