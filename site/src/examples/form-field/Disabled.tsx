import { ReactElement } from "react";
import { FormField, FlowLayout, FormFieldLabel, FormFieldHelperText, Input } from "@salt-ds/core";

export const Disabled = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
  <FormField disabled>
    <FormFieldLabel>Form Field label</FormFieldLabel>
    <Input defaultValue="Value" />
    <FormFieldHelperText>Helper text</FormFieldHelperText>
  </FormField>
</FlowLayout>
);
