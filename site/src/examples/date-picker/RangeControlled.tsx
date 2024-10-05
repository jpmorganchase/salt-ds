import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useState } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale, options)
    : startDate;
  const formattedEndDate = endDate
    ? formatDate(endDate, locale, options)
    : endDate;
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

export const RangeControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<DateRangeSelection | null>(
    null,
  );
  const handleSelectionChange = useCallback(
    (
      newSelectedDate: DateRangeSelection | null,
      error: { startDate: string | false; endDate: string | false },
    ) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
      console.log(
        `Error: startDate: ${error.startDate} endDate: ${error.endDate}`,
      );
      setSelectedDate(newSelectedDate);
    },
    [setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant="range"
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerRangeInput />
      <DatePickerOverlay>
        <DatePickerRangePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
