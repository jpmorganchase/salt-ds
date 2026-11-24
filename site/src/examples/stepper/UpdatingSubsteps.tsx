import {
  Button,
  FlexLayout,
  StackLayout,
  Step,
  Stepper,
  type StepStage,
} from "@salt-ds/core";
import { useState } from "react";

interface StepData {
  label: string;
  description?: string;
  substeps?: StepData[];
}

const steps: StepData[] = [
  {
    label: "Step",
    description: "Description text",
    substeps: [{ label: "Substep: Level 1" }],
  },
  {
    label: "Step",
    description: "Description text",
    substeps: [
      {
        label: "Substep: Level 1",
        substeps: [
          { label: "Substep: Level 2" },
          { label: "Substep: Level 2" },
        ],
      },
    ],
  },
  { label: "Step", description: "Description text" },
];

function getTerminalSteps(steps: StepData[]): StepData[] {
  return steps.flatMap((step) =>
    step.substeps ? getTerminalSteps(step.substeps) : [step],
  );
}

const terminalSteps = getTerminalSteps(steps);

function getStage(step: StepData, activeIndex: number): StepStage {
  if (!step.substeps) {
    const index = terminalSteps.indexOf(step);
    if (index < activeIndex) {
      return "completed";
    }
    if (index === activeIndex) {
      return "active";
    }
    return "pending";
  }

  const substepStages = step.substeps.map((substep) =>
    getStage(substep, activeIndex),
  );
  if (substepStages.every((stage) => stage === "completed")) {
    return "completed";
  }
  if (
    substepStages.some((stage) => stage === "active" || stage === "inprogress")
  ) {
    return "inprogress";
  }
  return "pending";
}

function renderStep(step: StepData, index: number, activeIndex: number) {
  return (
    <Step
      key={index}
      label={step.label}
      description={step.description}
      stage={getStage(step, activeIndex)}
      defaultExpanded={Boolean(step.substeps)}
    >
      {step.substeps?.map((substep, substepIndex) =>
        renderStep(substep, substepIndex, activeIndex),
      )}
    </Step>
  );
}

export const UpdatingSubsteps = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <StackLayout style={{ width: "271px" }}>
      <Stepper orientation="vertical" aria-label="Account opening">
        {steps.map((step, index) => renderStep(step, index, activeIndex))}
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
            setActiveIndex((index) =>
              Math.min(index + 1, terminalSteps.length - 1),
            )
          }
        >
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
