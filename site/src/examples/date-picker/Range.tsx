import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const dateFormatter = new DateFormatter(locale, options);
  const formattedStartDate = startDate
    ? dateFormatter.format(startDate.toDate(getLocalTimeZone()))
    : "N/A";
  const formattedEndDate = endDate
    ? dateFormatter.format(endDate.toDate(getLocalTimeZone()))
    : "N/A";
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

export const Range = (): ReactElement => (
  <DatePicker
    selectionVariant="range"
    onSelectedDateChange={(newSelectedDate) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    }}
  >
    <DatePickerRangeInput />
    <DatePickerOverlay>
      <DatePickerRangePanel />
    </DatePickerOverlay>
  </DatePicker>
);
