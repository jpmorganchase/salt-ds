import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Decimals = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Stepper input with decimal places</FormFieldLabel>
    <StepperInput
      defaultValue={376.0}
      decimalPlaces={2}
      step={0.01}
      endAdornment="USD"
    />
    <FormFieldHelperText>Please enter a currency value</FormFieldHelperText>
  </FormField>
);
