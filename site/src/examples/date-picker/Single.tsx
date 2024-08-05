import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

function formatDate(
  dateValue: SingleDateSelection | null,
  locale = "en-US",
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateFormatter = new DateFormatter(locale, options);
  return dateValue
    ? dateFormatter.format(dateValue.toDate(getLocalTimeZone()))
    : "N/A";
}

export const Single = (): ReactElement => (
  <DatePicker
    selectionVariant="single"
    onSelectedDateChange={(newSelectedDate) =>
      console.log(`Selected date: ${formatDate(newSelectedDate)}`)
    }
  >
    <DatePickerSingleInput />
    <DatePickerOverlay>
      <DatePickerSinglePanel />
    </DatePickerOverlay>
  </DatePicker>
);
