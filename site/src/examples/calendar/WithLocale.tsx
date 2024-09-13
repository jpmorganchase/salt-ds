import { getLocalTimeZone, today } from "@internationalized/date";
import { Calendar, CalendarNavigation } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const WithLocale = (): ReactElement => (
  <Calendar selectionVariant="single" locale="es-ES">
    <CalendarNavigation />
  </Calendar>
);
