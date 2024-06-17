import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";

export const Status = (): ReactElement => {
  return (
    <StackLayout
      direction="column"
      align="stretch"
      gap={10}
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={1}>
        <TrackerStep state="completed">
          <StepLabel>Completed</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Active</StepLabel>
        </TrackerStep>
        <TrackerStep state="warning">
          <StepLabel>Warning</StepLabel>
        </TrackerStep>
        <TrackerStep state="error">
          <StepLabel>Error</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Default</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};
