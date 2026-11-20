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
  { label: "Account details", substeps: ["Name", "Address"] },
  { label: "Identity check", substeps: ["Photo ID", "Proof of address"] },
  { label: "Funding", substeps: ["Funding source", "First deposit"] },
];

const substeps = steps.flatMap((step) => step.substeps);

function getStage(index: number, activeIndex: number): StepStage {
  if (index < activeIndex) {
    return "completed";
  }
  if (index === activeIndex) {
    return "active";
  }
  return "pending";
}

function getParentStage(substepStages: StepStage[]): StepStage {
  if (substepStages.every((stage) => stage === "completed")) {
    return "completed";
  }
  if (substepStages.includes("active")) {
    return "inprogress";
  }
  return "pending";
}

export const UpdatingSubsteps = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <StackLayout style={{ width: "240px" }}>
      <Stepper orientation="vertical" aria-label="Account opening">
        {steps.map((step) => {
          const substepStages = step.substeps.map((substep) =>
            getStage(substeps.indexOf(substep), activeIndex),
          );

          return (
            <Step
              key={step.label}
              label={step.label}
              stage={getParentStage(substepStages)}
              defaultExpanded
            >
              {step.substeps.map((substep, index) => (
                <Step
                  key={substep}
                  label={substep}
                  stage={substepStages[index]}
                />
              ))}
            </Step>
          );
        })}
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
            setActiveIndex((index) => Math.min(index + 1, substeps.length - 1))
          }
        >
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
