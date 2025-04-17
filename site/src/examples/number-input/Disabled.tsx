import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Disabled = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel></FormFieldLabel>
    <NumberInput  defaultValue={0} disabled/>
  </FormField>
);
