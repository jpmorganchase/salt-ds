import { StackLayout } from "@salt-ds/core";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Basic = (): ReactElement => {
  return (
    <StackLayout
      direction="column"
      align="stretch"
      gap={10}
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker
        activeStep={0}
        aria-label="Stepped Tracker example: first step active"
      >
        <TrackerStep>
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker
        activeStep={2}
        aria-label="Stepped Tracker example: third step active"
      >
        <TrackerStep stage="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep stage="pending">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep stage="pending">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker
        activeStep={3}
        aria-label="Stepped Tracker example: all steps complete"
      >
        <TrackerStep stage="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker
        activeStep={1}
        aria-label="Stepped Tracker example: status display options"
      >
        <TrackerStep stage="completed">
          <StepLabel>Completed</StepLabel>
        </TrackerStep>
        <TrackerStep stage="pending">
          <StepLabel>Active</StepLabel>
        </TrackerStep>
        <TrackerStep status="warning">
          <StepLabel>Warning</StepLabel>
        </TrackerStep>
        <TrackerStep status="error">
          <StepLabel>Error</StepLabel>
        </TrackerStep>
        <TrackerStep stage="pending">
          <StepLabel>Default</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};
