import {
  Calendar,
  CalendarDateGrid,
  CalendarNavigation,
  CalendarWeekHeader,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithLocale = (): ReactElement => (
  <Calendar selectionVariant="single" locale="es-ES">
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarDateGrid />
  </Calendar>
);
