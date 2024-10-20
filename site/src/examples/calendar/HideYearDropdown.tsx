import {
  Calendar,
  CalendarDateGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
export const HideYearDropdown = (): ReactElement => (
  <Calendar selectionVariant="single">
    <CalendarNavigation hideYearDropdown />
    <CalendarWeekHeader />
    <CalendarDateGrid />
  </Calendar>
);
