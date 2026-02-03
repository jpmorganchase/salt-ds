import { FormField, FormFieldLabel } from "@salt-ds/core";
import { AdapterDateFns } from "@salt-ds/date-adapters/date-fns";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  LocalizationProvider,
} from "@salt-ds/lab";
import { es as dateFnsEs } from "date-fns/locale";

import type { ReactElement } from "react";

export const WithLocale = (): ReactElement => (
  <LocalizationProvider DateAdapter={AdapterDateFns} locale={dateFnsEs}>
    <FormField style={{ width: "180px" }} lang="es">
      <FormFieldLabel>ES locale calendar</FormFieldLabel>
      <Calendar selectionVariant="single">
        <CalendarNavigation />
        <CalendarGrid />
      </Calendar>
    </FormField>
  </LocalizationProvider>
);
