import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function renderDayContents(day: DateFrameworkType) {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  return <>{dateAdapter.format(day, "DD")}</>;
}

export const CustomDayRender = (): ReactElement => (
  <Calendar selectionVariant="single" className="CustomDayRender">
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid getCalendarMonthProps={(date) => ({ renderDayContents })} />
  </Calendar>
);
