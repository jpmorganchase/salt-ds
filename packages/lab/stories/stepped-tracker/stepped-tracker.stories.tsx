import { useState } from "react";

import { SteppedTracker, TrackerStep } from "@salt-ds/lab";
import { Button, StackLayout } from "@salt-ds/core";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Stepped Tracker",
  component: "SteppedTracker",
};

const initialSteps = [
  {
    label: "Step One".repeat(5),
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
  const [steps, setSteps] = useState(initialSteps);

  return (
    <StackLayout direction="column" style={{ width: "100vw" }}>
      <SteppedTracker activeStep={activeStep}>
        {steps.map(({ label, completed }, i) => (
          <TrackerStep completed={completed} key={i}>
            {label}
          </TrackerStep>
        ))}
      </SteppedTracker>
      <StackLayout direction="row">
        <Button
          onClick={() => {
            setActiveStep((old) => {
              if (old < steps.length) {
                return old + 1;
              }
              return old;
            });
          }}
        >
          Skip
        </Button>
        <Button
          variant="cta"
          onClick={() => {
            setSteps((old) =>
              old.map((step, i) => {
                if (i !== activeStep) {
                  return step;
                }
                return {
                  ...step,
                  completed: true,
                };
              })
            );
            if (activeStep < steps.length) {
              setActiveStep((old) => old + 1);
            }
          }}
        >
          Complete
        </Button>
        <Button
          onClick={() => {
            setActiveStep((old) => {
              if (old > 0) {
                return old - 1;
              }
              return old;
            });
          }}
        >
          Previous
        </Button>
      </StackLayout>
    </StackLayout>
  );
};
