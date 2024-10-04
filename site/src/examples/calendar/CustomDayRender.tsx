import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
} from "@internationalized/date";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  CalendarWeekHeader,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function renderDayContents(day: DateValue) {
  const formatter = new DateFormatter(getCurrentLocale(), { day: "2-digit" });
  return <>{formatter.format(day.toDate(getLocalTimeZone()))}</>;
}

export const CustomDayRender = (): ReactElement => (
  <Calendar selectionVariant="single" className="CustomDayRender">
    <CalendarNavigation />
    <CalendarWeekHeader />
    <CalendarGrid getCalendarMonthProps={(date) => ({ renderDayContents })} />
  </Calendar>
);
