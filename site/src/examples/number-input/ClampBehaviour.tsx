import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const ClampBehaviour = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Number input with clamping, max = 100</FormFieldLabel>
        <NumberInput defaultValue={5} max={100} clampValue />
      </FormField>
    </StackLayout>
  );
};
