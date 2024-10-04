import { StackLayout } from "@salt-ds/core";
import { StepperInput } from "@salt-ds/lab";

export const Validation = () => (
  <StackLayout style={{ width: "256px" }}>
    <StepperInput defaultValue="Value" validationStatus="error" />
    <StepperInput defaultValue="Value" validationStatus="warning" />
    <StepperInput defaultValue="Value" validationStatus="success" />
  </StackLayout>
);
