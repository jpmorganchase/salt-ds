import { AdapterDateFns } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  LocalizationProvider,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";

import type { ReactElement } from "react";

export const WithLocale = (): ReactElement => (
  <LocalizationProvider DateAdapter={AdapterDateFns} locale={dateFnsEs}>
    <Calendar selectionVariant="single">
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  </LocalizationProvider>
);
