import { ReactElement } from "react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StepperInput,
} from "@salt-ds/core";

export const Decimals = (): ReactElement => (
  <FormField>
    <FormFieldLabel>Stepper Input with decimal places</FormFieldLabel>
    <StepperInput decimalPlaces={2} step={0.01} />
    <FormFieldHelperText>Please enter a number</FormFieldHelperText>
  </FormField>
);
