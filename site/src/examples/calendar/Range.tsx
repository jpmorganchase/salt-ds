import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Range = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 6 });

  return (
    <Calendar
      defaultSelectedDate={{ startDate, endDate }}
      selectionVariant="range"
    >
      <CalendarNavigation />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};
