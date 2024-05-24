import { ReactElement } from "react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StepperInput,
} from "@salt-ds/core";

export const Default = (): ReactElement => (
  <FormField>
    <FormFieldLabel>Default Stepper Input</FormFieldLabel>
    <StepperInput />
    <FormFieldHelperText>Please enter a number</FormFieldHelperText>
  </FormField>
);
