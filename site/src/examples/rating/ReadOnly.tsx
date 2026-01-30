import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const ReadOnly = (): ReactElement => (
  <FormField>
    <FormFieldLabel>Read-only example</FormFieldLabel>
    <Rating readOnly defaultValue={3} />
  </FormField>
);
