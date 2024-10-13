import { getLocalTimeZone, today } from "@internationalized/date";
import {
  DateInputRange,
  type DateInputRangeError,
  type DateRangeSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { ReactElement, SyntheticEvent } from "react";

function formatDateRange(
  dateRange: DateRangeSelection | null,
  locale = getCurrentLocale(),
): string {
  const { startDate, endDate } = dateRange || {};
  const formattedStartDate = startDate
    ? formatDate(startDate, locale)
    : startDate;
  const formattedEndDate = endDate ? formatDate(endDate, locale) : endDate;
  return `Start date: ${formattedStartDate}, End date: ${formattedEndDate}`;
}

const customValidator = (
  date: DateRangeSelection | null | undefined,
  error: DateInputRangeError,
): DateInputRangeError => {
  return {
    startDate: error.startDate
      ? { value: error.startDate.value, message: "custom start date error" }
      : error.startDate,
    endDate: error.endDate
      ? { value: error.endDate.value, message: "custom end date error" }
      : error.endDate,
  };
};

export const Range = (): ReactElement => {
  const handleDateChange = (
    _event: SyntheticEvent,
    newSelectedDate: DateRangeSelection | null,
    error: DateInputRangeError,
  ) => {
    console.log(`Selected date range: ${formatDateRange(newSelectedDate)}`);
    if (error.startDate) {
      console.log(`StartDate Error: ${error.startDate.message}`);
      if (error?.startDate?.value) {
        console.log(`Original Value: ${error.startDate.value}`);
      }
    }
    if (error.endDate) {
      console.log(`EndDate Error: ${error.endDate.message}`);
      if (error?.endDate?.value) {
        console.log(`Original Value: ${error.endDate.value}`);
      }
    }
  };
  return (
    <div style={{ width: "250px" }}>
      <DateInputRange
        defaultDate={{
          startDate: today(getLocalTimeZone()),
          endDate: today(getLocalTimeZone()).add({ days: 7 }),
        }}
        onDateChange={handleDateChange}
        validate={customValidator}
      />
    </div>
  );
};
