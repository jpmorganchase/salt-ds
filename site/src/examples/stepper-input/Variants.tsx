import { StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Variants = () => (
  <StackLayout style={{ width: "256px" }}>
    <StepperInput variant="primary" />
    <StepperInput variant="secondary" />
  </StackLayout>
);
