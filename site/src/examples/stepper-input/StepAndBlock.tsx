import { ReactElement } from "react";
import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StepperInput,
} from "@salt-ds/core";

export const StepAndBlock = (): ReactElement => (
  <FormField style={{ width: "250px" }}>
    <FormFieldLabel>Stepper Input with decimal places</FormFieldLabel>
    <StepperInput step={10} block={100} />
    <FormFieldHelperText>Please enter a value</FormFieldHelperText>
  </FormField>
);
