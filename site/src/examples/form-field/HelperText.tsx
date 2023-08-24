import { ReactElement } from "react";
import { FormField, FlowLayout, FormFieldLabel, FormFieldHelperText, Input } from "@salt-ds/core";

export const HelperText = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
  <FormField>
    <FormFieldLabel>Form Field label</FormFieldLabel>
    <Input defaultValue="Value" />
    <FormFieldHelperText>Helper text</FormFieldHelperText>
  </FormField>
</FlowLayout>
);
