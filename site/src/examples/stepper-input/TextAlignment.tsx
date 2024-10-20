import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const TextAlignment = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <StepperInput defaultValue="Value" textAlign="left" />
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <StepperInput defaultValue="Value" textAlign="center" />
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <StepperInput defaultValue="Value" textAlign="right" />
    </FormField>
  </StackLayout>
);
