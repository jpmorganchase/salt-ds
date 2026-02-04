import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Basic = (): ReactElement => (
  <FormField>
    <FormFieldLabel>Rate your experience</FormFieldLabel>
    <Rating />
  </FormField>
);
