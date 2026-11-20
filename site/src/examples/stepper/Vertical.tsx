import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Vertical = () => {
  return (
    <StackLayout>
      <Stepper orientation="vertical" aria-label="Account opening">
        <Step label="Account details" stage="completed" />
        <Step label="Identity check" stage="active" />
        <Step label="Funding" stage="pending" />
        <Step label="Review" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
