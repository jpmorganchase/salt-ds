import { StackLayout } from "@salt-ds/core";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Stepped Tracker/Stepped Tracker QA",
  component: SteppedTracker,
  subcomponents: { TrackerStep, StepLabel },
} as Meta<typeof SteppedTracker>;

export const Basic: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} width={1000} {...props}>
      <StackLayout
        direction="column"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <SteppedTracker orientation="horizontal" activeStep={0}>
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
        <SteppedTracker orientation="horizontal" activeStep={2}>
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
        <SteppedTracker activeStep={1}>
          <TrackerStep stage="completed" status="warning">
            <StepLabel>Completed with warning</StepLabel>
          </TrackerStep>
          <TrackerStep status="warning">
            <StepLabel>Active with warning</StepLabel>
          </TrackerStep>
          <TrackerStep stage="completed" status="error">
            <StepLabel>Completed with error</StepLabel>
          </TrackerStep>
          <TrackerStep stage="completed">
            <StepLabel>Completed</StepLabel>
          </TrackerStep>
        </SteppedTracker>
        <SteppedTracker activeStep={0}>
          <TrackerStep stage="completed">
            <StepLabel>Completed and active</StepLabel>
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
    </QAContainer>
  );
};

Basic.parameters = {
  chromatic: { disableSnapshot: false },
};

export const Vertical: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} width={1000} {...props}>
      <StackLayout
        direction="row"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <SteppedTracker orientation="vertical" activeStep={0}>
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
        <SteppedTracker orientation="vertical" activeStep={2}>
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
        <SteppedTracker orientation="vertical" activeStep={3}>
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
        <SteppedTracker orientation="vertical" activeStep={0}>
          <TrackerStep stage="completed">
            <StepLabel>Completed</StepLabel>
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
    </QAContainer>
  );
};

export const NestedVertical: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer height={500} width={1000} {...props}>
      <StackLayout
        direction="row"
        align="stretch"
        gap={2}
        style={{
          minWidth: 450,
          marginBottom: 50,
        }}
      >
        <SteppedTracker orientation="vertical" activeStep={0}>
          <TrackerStep>
            <StepLabel>1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={1}>
            <StepLabel>1.1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={1}>
            <StepLabel>1.2</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2}>
            <StepLabel>1.2.1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2}>
            <StepLabel>1.2.2</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2}>
            <StepLabel>1.2.3</StepLabel>
          </TrackerStep>
        </SteppedTracker>
        <SteppedTracker orientation="vertical" activeStep={4}>
          <TrackerStep stage="inprogress">
            <StepLabel>1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={1} stage="completed">
            <StepLabel>1.1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={1} stage="inprogress">
            <StepLabel>1.2</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2} stage="completed">
            <StepLabel>1.2.1</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2}>
            <StepLabel>1.2.2</StepLabel>
          </TrackerStep>
          <TrackerStep depth={2}>
            <StepLabel>1.2.3</StepLabel>
          </TrackerStep>
        </SteppedTracker>
      </StackLayout>
    </QAContainer>
  );
};

Basic.parameters = {
  chromatic: { disableSnapshot: false },
};
