import { FormField, FormFieldHelperText, FormFieldLabel } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const StepAndBlock = () => (
  <FormField style={{ width: "256px" }}>
    <FormFieldLabel>Custom steps</FormFieldLabel>
    <NumberInput defaultValue={10} step={5} stepMultiplier={10} />
    <FormFieldHelperText>
      Custom step 5 and step multiplier 10
    </FormFieldHelperText>
  </FormField>
);
