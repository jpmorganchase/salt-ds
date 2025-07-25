import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Decimals = () => (
  <StackLayout>
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with derived decimal scale</FormFieldLabel>
      <NumberInput
        defaultValue={100}
        step={0.01}
        fixedDecimalScale
        endAdornment="USD"
      />
    </FormField>
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input with set decimal scale</FormFieldLabel>
      <NumberInput defaultValue={100.25} decimalScale={2} endAdornment="USD" />
    </FormField>
  </StackLayout>
);
