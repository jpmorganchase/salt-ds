import { useState } from "react";

import { SteppedTracker, TrackerStep } from "@salt-ds/lab";
import { Button, StackLayout } from "@salt-ds/core";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Stepped Tracker",
  component: "SteppedTracker",
};

const defaultSteps = [
  {
    label: "Step One",
    completed: false,
  },
  {
    label: "Step Two",
    completed: false,
  },
  {
    label: "Step Three",
    completed: false,
  },
  {
    label: "Step Four",
    completed: false,
  },
];

export const Default: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(defaultSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const longText = "very ".repeat(30);

const truncatedSteps = [
  {
    label: `Step One: I am some ${longText} long text which will be truncated`,
    completed: false,
  },
  {
    label: `Step Two: I am some ${longText} long text which will be truncated`,
    completed: false,
  },
  {
    label: `Step Three: I am some ${longText} long text which will be truncated`,
    completed: false,
  },
  {
    label: `Step Four: I am some ${longText} long text which will be truncated`,
    completed: false,
  },
];

export const Truncated: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(truncatedSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const singleTruncatedSteps = [
  {
    label: `Step One`,
    completed: false,
  },
  {
    label: `Step Two: truncated on some screen sizes `,
    completed: false,
  },
  {
    label: `Step Three`,
    completed: false,
  },
  {
    label: `Step Four`,
    completed: false,
  },
];

export const SingleTruncated: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(singleTruncatedSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const completedSteps = [
  {
    label: "Step One",
    completed: true,
  },
  {
    label: "Step Two",
    completed: true,
  },
  {
    label: "Step Three",
    completed: true,
  },
  {
    label: "Step Four",
    completed: true,
  },
];

export const Completed: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(3);
  const [steps, setSteps] = useState(completedSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const halfwaySteps = [
  {
    label: "Step One",
    completed: true,
  },
  {
    label: "Step Two",
    completed: true,
  },
  {
    label: "Step Three",
    completed: false,
  },
  {
    label: "Step Four",
    completed: false,
  },
];

export const HalfWay: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(2);
  const [steps, setSteps] = useState(halfwaySteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const disabledSteps = [
  {
    label: "Step One",
    completed: false,
  },
  {
    label: "Step Two",
    completed: false,
  },
  {
    label: "Step Three",
    completed: false,
  },
  {
    label: "Step Four",
    completed: false,
  },
];

export const FullyDisabled: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(disabledSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker
        activeStep={activeStep}
        style={{ width: "100vw" }}
        disabled
      >
        {steps.map(({ label, completed }, key) => (
          <TrackerStep completed={completed} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};

const partlyDisabledSteps = [
  {
    label: "Step One",
    completed: false,
    disabled: false,
  },
  {
    label: "Step Two",
    completed: false,
    disabled: false,
  },
  {
    label: "Step Three",
    completed: false,
    disabled: true,
  },
  {
    label: "Step Four",
    completed: false,
    disabled: true,
  },
];

export const PartlyDisabled: ComponentStory<typeof SteppedTracker> = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [steps, setSteps] = useState(partlyDisabledSteps);

  const onNext = () => {
    setSteps((old) =>
      old.map((step, i) => ({
        ...step,
        completed: i === activeStep ? true : step.completed,
      }))
    );
    setActiveStep((old) => (old < steps.length - 1 ? old + 1 : old));
  };

  return (
    <StackLayout direction="column" align="center">
      <SteppedTracker activeStep={activeStep} style={{ width: "100vw" }}>
        {steps.map(({ label, completed, disabled }, key) => (
          <TrackerStep completed={completed} disabled={disabled} key={key}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <Button onClick={onNext} variant="cta">
        Next Step
      </Button>
    </StackLayout>
  );
};
