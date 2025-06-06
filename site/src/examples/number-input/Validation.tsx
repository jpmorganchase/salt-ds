import { StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Validation = () => (
  <StackLayout style={{ width: "256px" }}>
    <NumberInput defaultValue={0} validationStatus="error" />
    <NumberInput defaultValue={0} validationStatus="warning" />
    <NumberInput defaultValue={0} validationStatus="success" />
  </StackLayout>
);
