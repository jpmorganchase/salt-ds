import { ReactElement, useState } from "react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";

type Step = {
  label: string;
  state: "default" | "completed";
};

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
