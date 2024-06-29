import {
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Form Field label</FormFieldLabel>
      <Input defaultValue="Value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </FlowLayout>
);
