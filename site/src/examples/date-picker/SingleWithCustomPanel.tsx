import {
  DateFormatter,
  type DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import {
  DatePicker,
  DatePickerOverlay,
  DatePickerSingleInput,
  DatePickerSinglePanel,
  type SingleDateSelection,
} from "@salt-ds/lab";
import { CustomDatePickerPanel } from "@salt-ds/lab/stories/date-picker/CustomDatePickerPanel";
import React, { type ReactElement } from "react";

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

export const SingleWithCustomPanel = (): ReactElement => {
  const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2024)";
  const minDate = today(getLocalTimeZone());
  return (
    <FormField style={{ width: "256px" }}>
      <FormLabel>Select a date</FormLabel>
      <DatePicker
        minDate={minDate}
        maxDate={minDate.add({ years: 50 })}
        selectionVariant="single"
        onSelectedDateChange={(newSelectedDate) => {
          console.log(`Selected date: ${formatDate(newSelectedDate)}`);
        }}
      >
        <DatePickerSingleInput />
        <DatePickerOverlay>
          <CustomDatePickerPanel
            selectionVariant="single"
            helperText={helperText}
          />
        </DatePickerOverlay>
      </DatePicker>
      <FormHelperText>{helperText}</FormHelperText>
    </FormField>
  );
};
