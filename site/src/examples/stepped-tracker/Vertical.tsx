import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";

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
        <TrackerStep state="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep state="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep state="default">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep state="default">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker activeStep={3} orientation="vertical">
        <TrackerStep state="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep state="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep state="completed">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep state="completed">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};
