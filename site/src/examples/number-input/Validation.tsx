import { StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Validation = () => (
  <StackLayout style={{ width: "256px" }}>
    <NumberInput defaultValue="Value" validationStatus="error" />
    <NumberInput defaultValue="Value" validationStatus="warning" />
    <NumberInput defaultValue="Value" validationStatus="success" />
  </StackLayout>
);
