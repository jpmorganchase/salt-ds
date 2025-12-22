import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  return (
    <Calendar
      selectionVariant="single"
      defaultSelectedDate={dateAdapter.today()}
    >
      <CalendarNavigation
        MonthDropdownProps={{ bordered: true }}
        YearDropdownProps={{ bordered: true }}
      />
      <CalendarGrid />
    </Calendar>
  );
};
