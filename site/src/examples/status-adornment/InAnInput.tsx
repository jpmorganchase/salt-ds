import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  Input,
  StackLayout,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const InAnInput = (): ReactElement => (
  <StackLayout gap={2} style={{ width: 256 }}>
    <FormField validationStatus="error">
      <FormFieldLabel>Account number</FormFieldLabel>
      <Input defaultValue="12345" />
      <FormFieldHelperText>Enter all 8 digits.</FormFieldHelperText>
    </FormField>
    <FormField validationStatus="warning">
      <FormFieldLabel>Transfer amount</FormFieldLabel>
      <Input defaultValue="9,500.00" />
      <FormFieldHelperText>
        This is more than your usual transfer.
      </FormFieldHelperText>
    </FormField>
    <FormField validationStatus="success">
      <FormFieldLabel>Sort code</FormFieldLabel>
      <Input defaultValue="12-34-56" />
      <FormFieldHelperText>Sort code verified.</FormFieldHelperText>
    </FormField>
  </StackLayout>
);
