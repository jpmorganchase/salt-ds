import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const OffsetMultiselect = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const endDateOffset = (date: ReturnType<typeof dateAdapter.date>) =>
    dateAdapter.add(date, { days: 4 });
  const startDate = dateAdapter.today();
  const endDate = endDateOffset(startDate);
  return (
    <Calendar
      defaultSelectedDate={[{ startDate, endDate }]}
      endDateOffset={endDateOffset}
      selectionVariant="offset"
      multiselect={true}
    >
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
