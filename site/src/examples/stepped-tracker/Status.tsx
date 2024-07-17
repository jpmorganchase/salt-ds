import { StackLayout } from "@salt-ds/core";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Status = (): ReactElement => {
  return (
    <StackLayout
      direction="column"
      align="stretch"
      gap={10}
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={1}>
        <TrackerStep stage="completed">
          <StepLabel>Completed</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Active</StepLabel>
        </TrackerStep>
        <TrackerStep status="warning">
          <StepLabel>Warning</StepLabel>
        </TrackerStep>
        <TrackerStep status="error">
          <StepLabel>Error</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Default</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};
