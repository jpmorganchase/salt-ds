import { ReactElement } from "react";
import { DatePicker, DatePickerSinglePanel } from "@salt-ds/lab";
import { DateValue, getDayOfWeek } from "@internationalized/date";
import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";

const currentLocale = navigator.languages[0];
const isDayDisabled = (date: DateValue) =>
  getDayOfWeek(date, currentLocale) >= 5;

export const WithDisabledDates = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormLabel>Pick a date</FormLabel>
    <DatePicker selectionVariant="single">
      <DatePickerSinglePanel CalendarProps={{ isDayDisabled: isDayDisabled }} />
    </DatePicker>
  </FormField>
);
