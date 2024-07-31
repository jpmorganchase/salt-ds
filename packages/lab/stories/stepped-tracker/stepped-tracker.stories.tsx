import { useState } from "react";

import { Button, FlexLayout, StackLayout, Text, Tooltip } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Stepped Tracker",
  component: SteppedTracker,
  subcomponents: { TrackerStep, StepLabel },
} as Meta<typeof SteppedTracker>;

interface Step {
  label: string;
  state: "pending" | "completed";
}

type Steps = Step[];

const sampleSteps: Steps = [
  {
    label: "Step One",
    state: "pending",
  },
  {
    label: "Step Two",
    state: "pending",
  },
  {
    label: "Step Three",
    state: "pending",
  },
  {
    label: "Step Four",
    state: "pending",
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
        <TrackerStep stage="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Four</StepLabel>
        </TrackerStep>
      </SteppedTracker>
      <SteppedTracker activeStep={3}>
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

export const Status: StoryFn<typeof SteppedTracker> = () => {
  return (
    <div
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
    </div>
  );
};

export const SingleVertical: StoryFn<typeof SteppedTracker> = () => {
  return (
    <SteppedTracker
      orientation="vertical"
      activeStep={2}
      style={{ width: 400 }}
    >
      <TrackerStep stage="completed">
        <StepLabel>Step One</StepLabel>
        <Text color="secondary">
          A label that is very long describing the sub-steps and why they are
          there and stuff like that. Lorem ipsum dolor sit amet, consectetur.
        </Text>
      </TrackerStep>
      <TrackerStep stage="completed">
        <StepLabel>Step Two</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step Three</StepLabel>
        <Text color="secondary">This one has an extra label</Text>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step Four</StepLabel>
      </TrackerStep>
    </SteppedTracker>
  );
};

export const NestedVertical: StoryFn<typeof SteppedTracker> = () => {
  return (
    <SteppedTracker
      orientation="vertical"
      activeStep={8}
      style={{ width: 400 }}
    >
      <TrackerStep stage="completed">
        <StepLabel>Step 1</StepLabel>
        <Text color="secondary">
          A label that is very long describing the sub-steps and why they are
          there and stuff like that. Lorem ipsum dolor sit amet, consectetur.
        </Text>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2} stage="completed">
        <StepLabel>Step 1.1.1</StepLabel>
        <Text color="secondary">This one has an extra label</Text>
      </TrackerStep>
      <TrackerStep depth={2} stage="completed">
        <StepLabel>Step 1.1.2</StepLabel>
      </TrackerStep>
      <TrackerStep stage="completed">
        <StepLabel>Step 2</StepLabel>
      </TrackerStep>
      <TrackerStep stage="inprogress">
        <StepLabel>Step 3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="inprogress">
        <StepLabel>Step 3.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2} stage="completed">
        <StepLabel>Step 3.1.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2}>
        <StepLabel>Step 3.1.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={2}>
        <StepLabel>Step 3.1.3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1}>
        <StepLabel>Step 3.2</StepLabel>
        <Text color="secondary">This one has an extra label</Text>
      </TrackerStep>
      <TrackerStep depth={1}>
        <StepLabel>Step 3.3</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step 4</StepLabel>
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
        <TrackerStep stage="completed">
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep stage="completed">
          <StepLabel>Step Two</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step Three</StepLabel>
        </TrackerStep>
        <TrackerStep>
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
          : step,
      ),
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
        {steps.map(({ label, state }) => (
          <TrackerStep stage={state} key={label}>
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
        <TrackerStep>
          <StepLabel>Step One</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>
            Step Two: I am a label that wraps on smaller screen sizes
          </StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>
            Step Three: I am a label that wraps on smaller screen sizes
          </StepLabel>
        </TrackerStep>
        <TrackerStep>
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
              state: step.state === "pending" ? "completed" : "pending",
            }
          : step,
      ),
    );
  };

  return (
    <StackLayout
      direction="column"
      align="stretch"
      style={{ width: "100%", minWidth: 600, maxWidth: 800, margin: "auto" }}
    >
      <SteppedTracker activeStep={activeStep}>
        {steps.map(({ label, state }) => (
          <TrackerStep stage={state} key={label}>
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
