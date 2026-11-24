import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Vertical = () => {
  return (
    <StackLayout>
      <Stepper orientation="vertical" aria-label="Account opening">
        <Step label="Step" stage="completed" />
        <Step label="Step" stage="active" />
        <Step label="Step" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
