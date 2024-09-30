import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const StepAndBlock = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Custom steps</FormFieldLabel>
    <StepperInput defaultValue={10} step={5} stepBlock={50} />
    <FormFieldHelperText>Custom step 5 and step block 50</FormFieldHelperText>
  </FormField>
);
