import {
  Button,
  FlexLayout,
  StackLayout,
  Step,
  Stepper,
  type StepStage,
} from "@salt-ds/core";
import { useState } from "react";

const steps = ["Account details", "Identity check", "Funding", "Review"];

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
        {steps.map((label, index) => (
          <Step
            key={label}
            label={label}
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
            setActiveIndex((index) => Math.min(index + 1, steps.length - 1))
          }
        >
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
