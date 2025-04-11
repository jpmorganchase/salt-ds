import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Secondary = () => (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Secondary variant</FormFieldLabel>
      <NumberInput defaultValue={0} variant="secondary" />
    </FormField>
);
