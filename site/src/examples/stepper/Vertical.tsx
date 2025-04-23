import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Vertical = () => {
  return (
    <StackLayout>
      <Stepper orientation="vertical">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
