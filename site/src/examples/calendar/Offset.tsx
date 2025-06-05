import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Offset = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      defaultSelectedDate={{ startDate, endDate }}
      endDateOffset={endDateOffset}
      selectionVariant="offset"
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
