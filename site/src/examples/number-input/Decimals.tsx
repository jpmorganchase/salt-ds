import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Decimals = () => (
  <StackLayout>
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Number input</FormFieldLabel>
      <NumberInput defaultValue={100} step={0.01} endAdornment="USD" />
    </FormField>
  </StackLayout>
);
