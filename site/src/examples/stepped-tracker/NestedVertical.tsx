import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const NestedVertical = (): ReactElement => {
  return (
    <SteppedTracker
      orientation="vertical"
      activeStep={10}
      style={{ width: "100%", minWidth: 300, maxWidth: 400 }}
    >
      <TrackerStep stage="completed">
        <StepLabel>Step 1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2} stage="completed">
        <StepLabel>Step 1.2.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2} stage="completed">
        <StepLabel>Step 1.2.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.3</StepLabel>
      </TrackerStep>
      <TrackerStep stage="completed">
        <StepLabel>Step 2</StepLabel>
      </TrackerStep>
      <TrackerStep stage="inprogress">
        <StepLabel>Step 3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 3.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 3.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="inprogress">
        <StepLabel>Step 3.3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1}>
        <StepLabel>Step 3.4</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step 4</StepLabel>
      </TrackerStep>
    </SteppedTracker>
  );
};
