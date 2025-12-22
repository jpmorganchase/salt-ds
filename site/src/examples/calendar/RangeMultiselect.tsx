import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const RangeMultiselect = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const startDate = dateAdapter.today();
  const endDate = dateAdapter.add(startDate, { days: 4 });
  return (
    <Calendar
      defaultSelectedDate={[{ startDate, endDate }]}
      selectionVariant="range"
      multiselect={true}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
