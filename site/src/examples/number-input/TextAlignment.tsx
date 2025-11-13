import {
  FormField,
  FormFieldLabel,
  NumberInput,
  StackLayout,
} from "@salt-ds/core";

export const TextAlignment = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <NumberInput defaultValue={100} textAlign="left" />
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <NumberInput defaultValue={100} textAlign="center" />
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <NumberInput defaultValue={100} textAlign="right" />
    </FormField>
  </StackLayout>
);
