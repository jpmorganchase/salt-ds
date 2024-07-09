import {
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Disabled = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <FormField disabled>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <Input defaultValue="Value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </FlowLayout>
);
