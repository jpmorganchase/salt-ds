import { ReactElement, useState } from "react";
import { Button, FlexLayout, StackLayout, Tooltip } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";
import { RefreshIcon } from "@salt-ds/icons";

type Step = {
  label: string;
  state: "pending" | "completed";
};

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
          <TrackerStep TBC_PROP_NAME={state} key={key}>
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
