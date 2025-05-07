import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function renderDayContents(date: DateFrameworkType) {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  return <>{dateAdapter.format(date, "DD")}</>;
}

export const CustomDayRender = (): ReactElement => (
  <Calendar selectionVariant="single" className="CustomDayRender">
    <CalendarNavigation />
    <CalendarGrid getCalendarMonthProps={(_date: DateFrameworkType) => ({ renderDayContents })} />
  </Calendar>
);
