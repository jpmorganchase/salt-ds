import { StackLayout } from "@salt-ds/core";
import { Step, SteppedTracker } from "@salt-ds/lab";

export const Basic = () => {
  return (
    <StackLayout style={{ height: "40px", width: "100%" }}>
      <SteppedTracker>
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </SteppedTracker>
    </StackLayout>
  );
};
