import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const UnselectableDates = (): ReactElement => {
  const { dateAdapter } = useLocalization();
  const isDayUnselectable = (day: ReturnType<typeof dateAdapter.date>) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isWeekend =
      (dateAdapter.lib === "luxon" && (dayOfWeek === 7 || dayOfWeek === 6)) ||
      (dateAdapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));

    return isWeekend ? "weekends are un-selectable" : false;
  };
  return (
    <Calendar selectionVariant="single" isDayUnselectable={isDayUnselectable}>
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
