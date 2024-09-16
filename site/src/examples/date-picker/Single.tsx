import type { DateValue } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function formatSingleDate(
  date: DateValue | null,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
) {
  if (date) {
    return formatDate(date, locale, options);
  }
  return date;
}

export const Single = (): ReactElement => (
  <DatePicker
    selectionVariant="single"
    onSelectedDateChange={(newSelectedDate, _error) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
    }}
  >
    <DatePickerSingleInput />
    <DatePickerOverlay>
      <DatePickerSinglePanel />
    </DatePickerOverlay>
  </DatePicker>
);
