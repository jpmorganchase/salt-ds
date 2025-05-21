import { StackLayout, Step, Stepper } from "@salt-ds/core";

export const NestedSteps = () => {
  return (
    <StackLayout>
      <Stepper orientation="vertical">
        <Step label="Step 1" stage="completed">
          <Step label="Step 1.1" stage="completed" />
        </Step>
        <Step label="Step 2" stage="inprogress">
          <Step label="Step 2.1" stage="active" />
          <Step label="Step 2.2" stage="pending">
            <Step label="Step 2.2.1" stage="pending" />
            <Step label="Step 2.2.2" stage="pending" />
            <Step label="Step 2.2.3" stage="pending" />
          </Step>
        </Step>
        <Step label="Step 3">
          <Step label="Step 3.1" stage="pending" />
          <Step label="Step 3.2" stage="pending" />
          <Step label="Step 3.3" stage="pending">
            <Step label="Step 3.3.1" stage="pending" />
            <Step label="Step 3.3.2" stage="pending" />
            <Step label="Step 3.3.3" stage="pending" />
          </Step>
        </Step>
      </Stepper>
    </StackLayout>
  );
};
