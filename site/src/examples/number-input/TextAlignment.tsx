import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const TextAlignment = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <NumberInput defaultValue={123} textAlign="left" />
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <NumberInput defaultValue={123} textAlign="center" />
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <NumberInput defaultValue={123} textAlign="right" />
    </FormField>
  </StackLayout>
);
