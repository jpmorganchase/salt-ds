import { ReactElement } from "react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StepperInput,
} from "@salt-ds/core";

export const Default = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormFieldLabel>Default Stepper Input</FormFieldLabel>
    <StepperInput />
    <FormFieldHelperText>Please enter a value</FormFieldHelperText>
  </FormField>
);
