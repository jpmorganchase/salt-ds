import { useState } from "react";

import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";
import { Button, StackLayout, FlexLayout, Tooltip } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { StoryFn, Meta } from "@storybook/react";

export default {
  title: "Lab/Stepped Tracker",
  component: SteppedTracker,
  subcomponents: { TrackerStep, StepLabel },
} as Meta<typeof SteppedTracker>;

interface Step {
  label: string;
  state: "default" | "completed";
}

type Steps = Step[];

const sampleSteps: Steps = [
  {
    label: "Step One",
    state: "default",
  },
  {
    label: "Step Two",
    state: "default",
  },
  {
    label: "Step Three",
    state: "default",
  },
  {
    label: "Step Four",
    state: "default",
  },
];

export const Basic: StoryFn<typeof SteppedTracker> = () => {
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
      <SteppedTracker activeStep={3}>
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

export const SingleVertical: StoryFn<typeof SteppedTracker> = () => {
  return (
    <SteppedTracker orientation="vertical" activeStep={2}>
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
  );
};

export const BasicVertical: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      direction="row"
      align="stretch"
      gap={1}
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
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
      <SteppedTracker orientation="vertical" activeStep={3}>
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

export const AutoProgress: StoryFn<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(sampleSteps);
  const totalSteps = steps.length;

  const onComplete = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep((old) => old + 1);
    }

    setSteps((old) =>
      old.map((step, i) =>
        i === activeStep
          ? {
              ...step,
              state: "completed",
            }
          : step
      )
    );
  };

  const onRefresh = () => {
    setActiveStep(0);
    setSteps(sampleSteps);
  };

  return (
    <StackLayout
      direction="column"
      align="stretch"
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={activeStep}>
        {steps.map(({ label, state }, key) => (
          <TrackerStep state={state} key={key}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
      <FlexLayout justify="center" gap={1}>
        <Button onClick={onComplete}>Complete Step</Button>
        <Tooltip content="Reset">
          <Button onClick={onRefresh}>
            <RefreshIcon />
          </Button>
        </Tooltip>
      </FlexLayout>
    </StackLayout>
  );
};

export const WrappingLabel: StoryFn<typeof SteppedTracker> = () => {
  return (
    <StackLayout
      direction="column"
      align="stretch"
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={0}>
        <TrackerStep state="default">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep state="default">
          <StepLabel>
            Step Two: I am a label that wraps on smaller screen sizes
          </StepLabel>
        </TrackerStep>
        <TrackerStep state="default">
          <StepLabel>
            Step Three: I am a label that wraps on smaller screen sizes
          </StepLabel>
        </TrackerStep>
        <TrackerStep state="default">
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    </StackLayout>
  );
};

export const NonSequentialProgress: StoryFn<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(sampleSteps);
  const totalSteps = steps.length;

  const onNext = () => {
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  const onPrevious = () => {
    setActiveStep((old) => (old > 0 ? old - 1 : old));
  };

  const onToggleStep = () => {
    setSteps((old) =>
      old.map((step, i) =>
        i === activeStep
          ? {
              ...step,
              state: step.state === "default" ? "completed" : "default",
            }
          : step
      )
    );
  };

  return (
    <StackLayout
      direction="column"
      align="stretch"
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={activeStep}>
        {steps.map(({ label, state }, key) => (
          <TrackerStep state={state} key={key}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
      <FlexLayout justify="center" gap={1}>
        <Button onClick={onPrevious} disabled={activeStep <= 0}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={activeStep >= totalSteps - 1}>
          Next
        </Button>
        <Button onClick={onToggleStep}>Toggle Step</Button>
      </FlexLayout>
    </StackLayout>
  );
};
