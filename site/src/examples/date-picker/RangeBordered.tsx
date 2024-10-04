import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useCallback } from "react";

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

export const RangeBordered = (): ReactElement => {
  const handleSelectionChange = useCallback(
    (newSelectedDate: DateRangeSelection | null) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    },
    [],
  );

  return (
    <DatePicker
      selectionVariant="range"
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerRangeInput bordered />
      <DatePickerOverlay>
        <DatePickerRangePanel
          StartCalendarNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
          EndCalendarNavigationProps={{
            MonthDropdownProps: { bordered: true },
            YearDropdownProps: { bordered: true },
          }}
        />
      </DatePickerOverlay>
    </DatePicker>
  );
};
