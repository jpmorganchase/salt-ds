import { ReactElement } from "react";
import {
  FormField,
  FormFieldLabel,
  FormFieldHelperText,
  Input,
} from "@salt-ds/core";

export const Readonly = (): ReactElement => (
  <FormField style={{ width: "256px" }} readOnly>
    <FormFieldLabel>Readonly Form Field</FormFieldLabel>
    <Input defaultValue="Primary Input value" />
    <FormFieldHelperText>This Form Field is readonly</FormFieldHelperText>
  </FormField>
);
