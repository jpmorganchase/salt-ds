import { ReactElement, useState } from "react";
import { Button, FlexLayout, StackLayout, Text, Tooltip } from "@salt-ds/core";
import { SteppedTracker, TrackerStep, StepLabel } from "@salt-ds/lab";
import { RefreshIcon } from "@salt-ds/icons";

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
export const SingleLabel = (): ReactElement => {
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
      style={{
        margin: "auto",
        minWidth: 600,
        maxWidth: 800,
        width: "80%",
      }}
    >
      <SteppedTracker alignment="left" activeStep={activeStep}>
        {steps.map(({ label, state }, key) => (
          <TrackerStep
            aria-labelledby="stepper_label"
            state={state}
            key={key}
          ></TrackerStep>
        ))}
      </SteppedTracker>
      <Text id="stepper_label" style={{ marginTop: "var(--salt-spacing-100)" }}>
        Completed:
        <strong>{steps[activeStep].label}</strong>
      </Text>
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
