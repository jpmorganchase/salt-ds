import type { DateFrameworkType } from "@salt-ds/date-adapters";
import {
  Calendar,
  CalendarGrid,
  CalendarNavigation,
  useLocalization,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const DisabledDates = (): ReactElement => {
  const { dateAdapter } = useLocalization<DateFrameworkType>();
  const isDayDisabled = (day: ReturnType<typeof dateAdapter.date>) => {
    const dayOfWeek = dateAdapter.getDayOfWeek(day);
    const isWeekend =
      (dateAdapter.lib === "luxon" && (dayOfWeek === 7 || dayOfWeek === 6)) ||
      (dateAdapter.lib !== "luxon" && (dayOfWeek === 0 || dayOfWeek === 6));

    return isWeekend ? "Weekends are disabled" : false;
  };
  return (
    <Calendar selectionVariant="single" isDayDisabled={isDayDisabled}>
      <CalendarNavigation />
      <CalendarGrid />
    </Calendar>
  );
};
