import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

export const WithFormfield = (): ReactElement => (
  <FormField>
    <FormLabel>Pick a date</FormLabel>
    <DatePicker style={{ width: "256px" }} />
    <FormHelperText>Date format DD MMM YYYY (e.g. 09 Jun 2021)</FormHelperText>
  </FormField>
);
