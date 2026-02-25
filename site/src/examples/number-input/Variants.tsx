import { NumberInput, StackLayout } from "@salt-ds/core";

export const Variants = () => (
  <StackLayout style={{ width: "256px" }}>
    <NumberInput defaultValue={0} variant="primary" />
    <NumberInput defaultValue={0} variant="secondary" />
    <NumberInput defaultValue={0} variant="tertiary" />
  </StackLayout>
);
