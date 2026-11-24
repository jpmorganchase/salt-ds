import {
  Button,
  FlexLayout,
  StackLayout,
  Step,
  Stepper,
  type StepStage,
} from "@salt-ds/core";
import { useState } from "react";

const steps = [
  { label: "Step 1", description: "Description text" },
  { label: "Step 2", description: "Description text" },
  { label: "Step 3", description: "Description text" },
];

function getStage(index: number, activeIndex: number): StepStage {
  if (index < activeIndex) {
    return "completed";
  }
  if (index === activeIndex) {
    return "active";
  }
  return "pending";
}

export const UpdatingProgress = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <StackLayout style={{ width: "100%" }}>
      <Stepper aria-label="Account opening">
        {steps.map((step, index) => (
          <Step
            key={step.label}
            label={step.label}
            description={step.description}
            stage={getStage(index, activeIndex)}
          />
        ))}
      </Stepper>
      <FlexLayout gap={1} justify="end">
        <Button
          sentiment="accented"
          appearance="bordered"
          onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
        >
          Previous
        </Button>
        <Button
          sentiment="accented"
          onClick={() =>
            setActiveIndex((index) => Math.min(index + 1, steps.length))
          }
        >
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
