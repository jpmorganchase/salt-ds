import { ReactElement } from "react";
import { DatePicker } from "@salt-ds/lab";
import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";

export const Range = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormLabel>Pick a range</FormLabel>
    <DatePicker selectionVariant="range" />
    <FormHelperText>
      Select a start and end date, format DD MMM YYYY (e.g. 09 Jun 2021)
    </FormHelperText>
  </FormField>
);
