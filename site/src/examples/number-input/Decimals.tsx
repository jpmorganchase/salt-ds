import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Decimals = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Number input with decimal places</FormFieldLabel>
    <NumberInput
      defaultValue={376.0}
      decimalPlaces={2}
      step={0.01}
      endAdornment="USD"
    />
    <FormFieldHelperText>Please enter a currency value</FormFieldHelperText>
  </FormField>
);
