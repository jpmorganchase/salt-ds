import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const ClampBehaviour = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Number input with default clamping</FormFieldLabel>
        <NumberInput
          defaultValue={5}
          max={100}
          min={0}
          clampBehaviour="default"
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Number input with strict clamping</FormFieldLabel>
        <NumberInput
          defaultValue={5}
          max={100}
          min={0}
          clampBehaviour="strict"
        />
      </FormField>
    </StackLayout>
  );
};
