import { StackLayout } from "@salt-ds/core";
import { Step, SteppedTracker } from "@salt-ds/lab";

export const OrientationVertical = () => {
  return (
    <StackLayout style={{ width: "120px" }}>
      <SteppedTracker orientation="vertical">
        <Step label="Step 1" stage="completed" />
        <Step label="Step 2" stage="active" />
        <Step label="Step 3" stage="pending" />
      </SteppedTracker>
    </StackLayout>
  );
};
