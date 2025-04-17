import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Primary = () => (
    <FormField style={{ width: "256px" }}>
      <FormFieldLabel>Primary variant</FormFieldLabel>
      <NumberInput defaultValue={0} variant="primary" />
    </FormField>
);
