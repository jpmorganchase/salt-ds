import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Bordered = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  return (
    <Calendar
      selectionVariant="single"
      defaultSelectedDate={dateAdapter.today()}
    >
      <CalendarNavigation
        MonthDropdownProps={{ bordered: true }}
        YearDropdownProps={{ bordered: true }}
      />
      <CalendarWeekHeader />
      <CalendarGrid />
    </Calendar>
  );
};
