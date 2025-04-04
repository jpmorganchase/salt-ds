import { FormField, FormFieldLabel, StackLayout, Input } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const ReadOnly = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Read-only with value</FormFieldLabel>
      <NumberInput readOnly defaultValue={5} />
    </FormField>
    <FormField>
      <FormFieldLabel>Read-only without value</FormFieldLabel>
      <NumberInput readOnly valueIsNumericString emptyReadOnlyMarker={"x"}/>
    </FormField>
  </StackLayout>
);
