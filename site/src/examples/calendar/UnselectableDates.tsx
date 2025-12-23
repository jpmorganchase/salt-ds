import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { Dayjs } from "dayjs";
import type { DateTime } from "luxon";
import type { Moment } from "moment";
import type { ReactElement } from "react";

export const UnselectableDates = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();

  const isDayUnselectable = (day: DateFrameworkType) => {
    let dayOfWeek: number;

    if (dateAdapter.lib === "luxon") {
      // Luxon: 1 (Monday) to 7 (Sunday)
      dayOfWeek = (day as DateTime).weekday;
    } else if (dateAdapter.lib === "moment") {
      // Moment: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Moment).day();
    } else if (dateAdapter.lib === "dayjs") {
      // Day.js: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Dayjs).day();
    } else {
      // date-fns: 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (day as Date).getDay();
    }

    const isWeekend =
      dateAdapter.lib === "luxon"
        ? dayOfWeek === 6 || dayOfWeek === 7 // Saturday or Sunday
        : dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    return isWeekend ? "weekends are un-selectable" : false;
  };

  return (
    <Calendar selectionVariant="single" isDayUnselectable={isDayUnselectable}>
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
