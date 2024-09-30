import { StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Bordered = () => (
  <StackLayout style={{ width: "256px" }}>
    <StepperInput defaultValue={0} variant="primary" bordered />
    <StepperInput defaultValue={0} variant="primary" bordered />
  </StackLayout>
);
