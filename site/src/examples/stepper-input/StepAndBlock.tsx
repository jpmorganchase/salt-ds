import { ReactElement } from "react";
import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const StepAndBlock = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormFieldLabel>Stepper Input with decimal places</FormFieldLabel>
    <StepperInput step={10} block={100} />
    <FormFieldHelperText>Please enter a value</FormFieldHelperText>
  </FormField>
);
