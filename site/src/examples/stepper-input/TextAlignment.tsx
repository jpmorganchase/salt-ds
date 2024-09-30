import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const TextAlignments = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Left aligned</FormFieldLabel>
      <StepperInput textAlign="left" />
    </FormField>
    <FormField>
      <FormFieldLabel>Center aligned</FormFieldLabel>
      <StepperInput textAlign="center" />
    </FormField>
    <FormField>
      <FormFieldLabel>Right aligned</FormFieldLabel>
      <StepperInput textAlign="right" />
    </FormField>
  </StackLayout>
);
