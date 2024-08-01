import { StackLayout } from "@salt-ds/core";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Vertical = (): ReactElement => {
  return (
    <StackLayout
      direction={{ xs: "column", sm: "row", md: "column", lg: "row" }}
      gap={8}
      style={{ height: "100%", maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={0} orientation="vertical">
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
      <SteppedTracker activeStep={2} orientation="vertical">
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
      <SteppedTracker activeStep={3} orientation="vertical">
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
    </StackLayout>
  );
};
