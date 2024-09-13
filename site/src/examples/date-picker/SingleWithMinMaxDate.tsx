import { CalendarDate, type DateValue } from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
  formatDate,
  getCurrentLocale,
} from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

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

export const SingleWithMinMaxDate = (): ReactElement => {
  const [selectedDate, setSelectedDate] = useState<SingleDateSelection | null>(
    null,
  );
  const helperText = "Valid between 15/01/2030 and 15/01/2031";
  return (
    <FormField style={{ width: "256px" }}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        selectionVariant={"single"}
        selectedDate={selectedDate}
        onSelectedDateChange={(newSelectedDate, _error) => {
          console.log(`Selected date: ${formatSingleDate(newSelectedDate)}`);
          setSelectedDate(newSelectedDate);
        }}
        minDate={new CalendarDate(2030, 1, 15)}
        maxDate={new CalendarDate(2031, 1, 15)}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <DatePickerSinglePanel
            defaultVisibleMonth={new CalendarDate(2030, 1, 1)}
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormFieldHelperText>{helperText}</FormFieldHelperText>
    </FormField>
  );
};
