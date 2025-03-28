import {FormField, FormFieldLabel, StackLayout} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Validation = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Error</FormFieldLabel>
      <NumberInput defaultValue={123} validationStatus="error" />
    </FormField>
    <FormField>
      <FormFieldLabel>Warning</FormFieldLabel>
      <NumberInput defaultValue={123} validationStatus="warning" />
    </FormField>
    <FormField>
      <FormFieldLabel>Success</FormFieldLabel>
      <NumberInput defaultValue={123} validationStatus="success" />
    </FormField>
  </StackLayout>
);
