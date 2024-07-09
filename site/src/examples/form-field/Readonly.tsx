import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Readonly = (): ReactElement => (
  <FormField style={{ width: "256px" }} readOnly>
    <FormFieldLabel>Readonly Form Field</FormFieldLabel>
    <Input defaultValue="Primary Input value" />
    <FormFieldHelperText>This Form Field is readonly</FormFieldHelperText>
  </FormField>
);
