import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

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
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  return (
    <DatePicker
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectedDateChange={(newSelectedDate: DateRangeSelection | null) => {
        console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerRangeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
