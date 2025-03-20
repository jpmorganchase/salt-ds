import { StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Variants = () => (
  <StackLayout style={{ width: "256px" }}>
    <NumberInput defaultValue={0} variant="primary" />
    <NumberInput defaultValue={0} variant="secondary" />
  </StackLayout>
);
