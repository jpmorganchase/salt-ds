import { type ReactElement, useState } from "react";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type DateRangeSelection,
  SingleDateSelection,
} from "@salt-ds/lab";

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

export const SingleControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] =
    useState<SingleDateSelection | null>(null);
  return (
    <DatePicker
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectedDateChange={(
        newSelectedDate: SingleDateSelection | null,
      ) => {
        console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        setSelectedDate(newSelectedDate);
      }}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
