import type { DateValue } from "@internationalized/date";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale, SingleDatePickerError,
} from "@salt-ds/lab";
import { type ReactElement, useCallback, useState } from "react";

function formatSingleDate(
  date: DateValue | null | undefined,
  locale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
) {
  if (date) {
    return formatDate(date, locale, options);
  }
  return date;
}

export const SingleControlled = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null | undefined>(
    null,
  );
  const handleSelectionChange = useCallback(
    (newSelectedDate: SingleDateSelection | null | undefined, error: SingleDatePickerError) => {
      console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
      console.log(`Error: ${error}`);
      setSelectedDate(newSelectedDate);
    },
    [setSelectedDate],
  );

  return (
    <DatePicker
      selectionVariant={"single"}
      selectedDate={selectedDate}
      onSelectionChange={handleSelectionChange}
    >
      <DatePickerSingleInput />
      <DatePickerOverlay>
        <DatePickerSinglePanel />
      </DatePickerOverlay>
    </DatePicker>
  );
};
