import { FormField, FormFieldLabel } from "@salt-ds/core";
import { Rating } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <FormField>
    <FormFieldLabel>Disabled example</FormFieldLabel>
    <Rating disabled defaultValue={3} />
  </FormField>
);
