import { StackLayout } from "@salt-ds/core";
import { Step, Stepper } from "@salt-ds/lab";

export const NestedSteps = () => {
  return (
    <StackLayout style={{ minWidth: "240px" }}>
      <Stepper orientation="vertical">
        <Step label="Step 1">
          <Step label="Step 1.1" />
        </Step>
        <Step label="Step 2">
          <Step label="Step 2.1" />
          <Step label="Step 2.2">
            <Step label="Step 2.2.1" />
            <Step label="Step 2.2.2" />
            <Step label="Step 2.2.3" />
          </Step>
        </Step>
        <Step label="Step 3">
          <Step label="Step 3.1" />
          <Step label="Step 3.2" />
          <Step label="Step 3.3">
            <Step label="Step 3.3.1" />
            <Step label="Step 3.3.2" />
            <Step label="Step 3.3.3" />
          </Step>
        </Step>
      </Stepper>
    </StackLayout>
  );
};
