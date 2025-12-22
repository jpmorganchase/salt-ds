import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Range = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 6 });

  return (
    <Calendar
      defaultSelectedDate={{ startDate, endDate }}
      selectionVariant="range"
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
