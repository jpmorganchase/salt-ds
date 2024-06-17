import { ReactElement } from "react";
import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Decimals = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormFieldLabel>Stepper Input with decimal places</FormFieldLabel>
    <StepperInput decimalPlaces={2} step={0.01} />
    <FormFieldHelperText>Please enter a value</FormFieldHelperText>
  </FormField>
);
