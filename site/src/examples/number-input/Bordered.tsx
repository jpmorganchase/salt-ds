import { StackLayout } from "@salt-ds/core";
import { NumberInput } from "@salt-ds/lab";

export const Bordered = () => (
  <StackLayout style={{ width: "256px" }}>
    <NumberInput defaultValue={0} variant="primary" bordered />
    <NumberInput defaultValue={0} variant="secondary" bordered />
  </StackLayout>
);
