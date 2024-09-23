import { Button, FlexLayout, StackLayout, Tooltip } from "@salt-ds/core";
import { RefreshIcon } from "@salt-ds/icons";
import { StepLabel, SteppedTracker, TrackerStep } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

type Step = {
  label: string;
  stage: "pending" | "completed";
};

type Steps = Step[];

const sampleSteps: Steps = [
  {
    label: "Step One",
    stage: "pending",
  },
  {
    label: "Step Two",
    stage: "pending",
  },
  {
    label: "Step Three",
    stage: "pending",
  },
  {
    label: "Step Four",
    stage: "pending",
  },
];

export const StepProgression = (): ReactElement => {
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
              stage: "completed",
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
      <SteppedTracker
        activeStep={activeStep}
        aria-label="Stepped Tracker example: step progression"
      >
        {steps.map(({ label, stage }, key) => (
          <TrackerStep stage={stage} key={key}>
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
