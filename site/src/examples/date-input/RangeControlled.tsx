import { getLocalTimeZone, today } from "@internationalized/date";
import {
  DateInputRange,
  type DateRangeSelection,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, type SyntheticEvent, useState } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate ? formatDate(startDate, locale) : "N/A";
  const formattedEndDate = endDate ? formatDate(endDate, locale) : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

export const RangeControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>({
    startDate: today(getLocalTimeZone()),
    endDate: today(getLocalTimeZone()).add({ days: 7 }),
  });

  const handleDateChange =
    () =>
    (_event: SyntheticEvent, newSelectedDate: DateRangeSelection | null) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    };
  const handleDateValueChange = () => (newDateValue: string) => {
    console.log(`Date value: ${newDateValue}`);
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputRange
        date={selectedDate}
        onDateChange={handleDateChange}
        onDateValueChange={handleDateValueChange}
      />
    </div>
  );
};
