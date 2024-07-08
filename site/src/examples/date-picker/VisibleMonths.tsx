import {
  FormField,
  FormFieldHelperText as FormHelperText,
  FormFieldLabel as FormLabel,
} from "@salt-ds/core";
import { DatePicker } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const VisibleMonths = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormLabel>Pick a range</FormLabel>
    <DatePicker selectionVariant="range" visibleMonths={1} />
    <FormHelperText>
      Select a start and end date, format DD MMM YYYY (e.g. 09 Jun 2021)
    </FormHelperText>
  </FormField>
);
