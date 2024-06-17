import { ReactElement } from "react";
import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Default = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormFieldLabel>Default Stepper Input</FormFieldLabel>
    <StepperInput />
    <FormFieldHelperText>Please enter a value</FormFieldHelperText>
  </FormField>
);
