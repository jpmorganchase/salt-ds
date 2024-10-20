import { StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Variants = () => (
  <StackLayout style={{ width: "256px" }}>
    <StepperInput defaultValue={0} variant="primary" />
    <StepperInput defaultValue={0} variant="secondary" />
  </StackLayout>
);
