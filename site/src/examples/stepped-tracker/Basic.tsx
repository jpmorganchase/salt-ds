import { ReactElement } from "react";
import { StackLayout } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";

export const Basic = (): ReactElement => {
  return (
    <StackLayout
      direction="column"
      align="stretch"
      gap={10}
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={0}>
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
      <SteppedTracker activeStep={2}>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="pending">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="pending">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker activeStep={3}>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker activeStep={2}>
        <TrackerStep TBC_PROP_NAME="completed">
          <StepLabel>Completed</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="pending">
          <StepLabel>Active</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="warning">
          <StepLabel>Warning</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="error">
          <StepLabel>Error</StepLabel>
        </TrackerStep>
        <TrackerStep TBC_PROP_NAME="pending">
          <StepLabel>Default</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};
