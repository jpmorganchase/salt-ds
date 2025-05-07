import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
export const HideYearDropdown = (): ReactElement => (
  <Calendar selectionVariant="single">
    <CalendarNavigation hideYearDropdown />
    <CalendarGrid />
  </Calendar>
);
