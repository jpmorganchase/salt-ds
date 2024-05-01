import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

export const WithFormField = (): ReactElement => (
  <FormField style={{ width: "256px" }}>
    <FormLabel>Pick a date</FormLabel>
    <DatePicker />
    <FormHelperText>Date format DD MMM YYYY (e.g. 09 Jun 2021)</FormHelperText>
  </FormField>
);
