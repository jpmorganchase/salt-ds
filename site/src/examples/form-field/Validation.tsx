import {
  FlowLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Validation = (): ReactElement => (
  <FlowLayout style={{ width: "256px" }}>
    <FormField validationStatus="error">
      <FormFieldLabel>Error Form Field</FormFieldLabel>
      <Input defaultValue="Input value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField validationStatus="warning">
      <FormFieldLabel>Warning Form Field</FormFieldLabel>
      <Input defaultValue="Input value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
    <FormField validationStatus="success">
      <FormFieldLabel>Success Form Field</FormFieldLabel>
      <Input defaultValue="Input value" />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  </FlowLayout>
);
