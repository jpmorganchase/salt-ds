import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Negative = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>Allow negative to be typed (default)</FormFieldLabel>
      <NumberInput defaultValue="1" allowNegative={true} />
    </FormField>
    <FormField>
      <FormFieldLabel>Don't allow negative to be typed</FormFieldLabel>
      <NumberInput defaultValue="1" allowNegative={false} min={0} />
    </FormField>
  </StackLayout>
);
