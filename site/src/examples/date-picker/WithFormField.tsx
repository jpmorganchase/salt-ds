import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { DatePicker } from "@salt-ds/lab";
import type { ReactElement } from "react";

const helperText = "Date format DD MMM YYYY (e.g. 09 Jun 2021)";

export const WithFormField = (): ReactElement => (
  <FormField style={{ width: "200px" }}>
    <FormLabel>Pick a date</FormLabel>
    <DatePicker helperText={helperText} />
    <FormHelperText>{helperText}</FormHelperText>
  </FormField>
);
