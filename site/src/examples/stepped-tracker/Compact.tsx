import { useState } from "react";

import { SteppedTracker, TrackerStep } from "@salt-ds/lab";
import { Button, StackLayout, FlexLayout, Tooltip, Text } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { StoryFn } from "@storybook/react";

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

export const Compact: StoryFn<typeof SteppedTracker> = () => {
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
      <div>
        <SteppedTracker
          activeStep={activeStep}
          orientation="horizontal-compact"
        >
          {steps.map(({ state }, key) => (
            <TrackerStep state={state} key={key} />
          ))}
        </SteppedTracker>
        <Text>
          Step {activeStep + 1} of {steps.length}:{" "}
          <strong>{steps[activeStep].label}</strong>
        </Text>
      </div>
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
