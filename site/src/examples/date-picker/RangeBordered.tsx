import {
  DatePicker,
  DatePickerOverlay,
  DatePickerRangeInput,
  DatePickerRangePanel,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import React, { type ReactElement } from "react";

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

export const RangeBordered = (): ReactElement => (
  <DatePicker
    selectionVariant="range"
    onSelectedDateChange={(newSelectedDate, _error) => {
      console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    }}
  >
    <DatePickerRangeInput bordered />
    <DatePickerOverlay>
      <DatePickerRangePanel
        StartNavigationProps={{
          MonthDropdownProps: { bordered: true },
          YearDropdownProps: { bordered: true },
        }}
        EndNavigationProps={{
          MonthDropdownProps: { bordered: true },
          YearDropdownProps: { bordered: true },
        }}
      />
    </DatePickerOverlay>
  </DatePicker>
);
