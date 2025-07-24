import {
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  StackLayout,
} from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const ClampBehaviour = () => {
  return (
    <StackLayout style={{ width: "256px" }}>
      <FormField>
        <FormFieldLabel>Number input with clamped range</FormFieldLabel>
        <NumberInput defaultValue={2} min={0} max={10} clamp />
        <FormFieldHelperText>
          Limit value must be between 0 and 10
        </FormFieldHelperText>
      </FormField>
    </StackLayout>
  );
};
