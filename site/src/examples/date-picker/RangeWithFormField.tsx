import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

export const RangeWithFormField = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormLabel>Select date range</FormLabel>
    <DatePicker selectionVariant="range" />
    <FormHelperText>Date format DD MMM YYYY (e.g. 09 Jun 2021)</FormHelperText>
  </FormField>
);
