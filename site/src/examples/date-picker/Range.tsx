import type { ReactElement } from "react";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection, formatDate, getCurrentLocale,
} from "@salt-ds/lab";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate ? formatDate(startDate, locale) : "N/A";
  const formattedEndDate = endDate ? formatDate(endDate, locale) : "N/A";
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
