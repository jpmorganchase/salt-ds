import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const Horizontal = () => {
  return (
    <StackLayout style={{ width: "100%" }}>
      <Stepper orientation="horizontal">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </Stepper>
    </StackLayout>
  );
};
