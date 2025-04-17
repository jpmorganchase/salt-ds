import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Bordered = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Primary variant</FormFieldLabel>
      <NumberInput defaultValue={0} variant="primary" bordered />
    </FormField>
    <FormField>
      <FormFieldLabel>Secondary variant</FormFieldLabel>
      <NumberInput defaultValue={0} variant="secondary" bordered />
    </FormField>
  </StackLayout>
);
