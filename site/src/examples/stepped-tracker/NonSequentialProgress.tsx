import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
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

export const NonSequentialProgress = (): ReactElement => {
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
              stage: step.stage === "pending" ? "completed" : "pending",
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
      <SteppedTracker
        activeStep={activeStep}
        aria-label="Stepped Tracker example: non sequential progress"
      >
        {steps.map(({ label, stage }, key) => (
          <TrackerStep stage={stage} key={key}>
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
