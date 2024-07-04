import { ReactElement } from "react";
import { DatePicker, DatePickerSinglePanel } from "@salt-ds/lab";
import { FormField, FormFieldLabel as FormLabel } from "@salt-ds/core";

export const Single = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormLabel>Pick a date</FormLabel>
    <DatePicker selectionVariant="single">
      <DatePickerSinglePanel helperText="Select a date, format DD MMM YYYY (e.g. 09 Jun 2021)" />
    </DatePicker>
  </FormField>
);
