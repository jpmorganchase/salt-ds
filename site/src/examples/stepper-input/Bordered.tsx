import { StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Bordered = () => (
  <StackLayout style={{ width: "256px" }}>
    <StepperInput variant="primary" bordered />
    <StepperInput variant="primary" bordered />
  </StackLayout>
);
