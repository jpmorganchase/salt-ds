import { FormField, FormFieldLabel, StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Placeholder = () => (
  <StackLayout style={{ width: "256px" }}>
    <FormField>
      <FormFieldLabel>With placeholder</FormFieldLabel>
      <NumberInput placeholder={"Enter a number"} />
    </FormField>
    <FormField>
      <FormFieldLabel>Disabled with placeholder </FormFieldLabel>
      <NumberInput disabled placeholder={"Enter a number"} />
    </FormField>
    <FormField>
      <FormFieldLabel>Read-only with placeholder </FormFieldLabel>
      <NumberInput readOnly placeholder={"Enter a number"} />
    </FormField>
  </StackLayout>
);
