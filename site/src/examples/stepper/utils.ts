import type { StepProps, StepStage, StepStatus } from "@salt-ds/core";
import type { ReactNode } from "react";

export type StepRecord = StepProps & { id: string };

export function assignStepsStage(
  steps: StepRecord[],
  stage?: StepStage,
): StepRecord[] {
  return steps.map((step) => {
    if (!step.children) {
      return { ...step, stage };
    }

    return {
      ...step,
      stage,
      substeps: assignStepsStage(step.children as StepRecord[], stage),
    };
  });
}

export function assignStepStatus(
  steps: StepRecord[],
  stepId: string,
  status: StepStatus | undefined,
): StepRecord[] {
  return steps.map((step) => {
    if (step.id === stepId) {
      return { ...step, status };
    }

    if (step.children) {
      return {
        ...step,
        substeps: assignStepStatus(
          step.children as StepRecord[],
          stepId,
          status,
        ),
      };
    }

    return step;
  });
}

export function resetSteps(
  steps: StepRecord[],
  options = { resetStatus: false },
): StepRecord[] {
  const { resetStatus } = options;

  return steps.map((step) => {
    if (!step.children) {
      return {
        ...step,
        stage: undefined,
        status: !resetStatus ? step.status : undefined,
      };
    }

    return {
      ...step,
      stage: undefined,
      substeps: resetSteps(step.children as StepRecord[], options),
    };
  });
}

export function autoStageSteps(
  steps: StepRecord[],
  options?: {
    activeStepId?: string;
  },
): StepRecord[] {
  function autoStageHelper(steps: StepRecord[]): StepRecord[] | null {
    const pivotIndex = steps.findIndex(
      (step) =>
        (step?.id &&
          options?.activeStepId &&
          step.id === options.activeStepId) ||
        step.stage === "active" ||
        step.stage === "inprogress",
    );

    if (pivotIndex !== -1) {
      const activeStep = steps[pivotIndex];

      activeStep.stage ||= "active";

      const previousSteps = assignStepsStage(
        steps.slice(0, pivotIndex),
        "completed",
      );
      const nextSteps = assignStepsStage(
        steps.slice(pivotIndex + 1),
        "pending",
      );

      return [...previousSteps, activeStep, ...nextSteps] as StepRecord[];
    }

    return steps.reduce(
      (acc, step, index) => {
        if (step.children) {
          const substeps = autoStageHelper(step.children as StepRecord[]);

          if (substeps) {
            steps[index].children = substeps as ReactNode;
            steps[index].stage = "inprogress";

            return autoStageHelper(steps);
          }
        }

        return acc;
      },
      null as StepRecord[] | null,
    );
  }

  return (
    autoStageHelper(steps) ||
    assignStepsStage(steps, steps[0].stage || "pending")
  );
}

export function flattenSteps(steps: StepRecord[]): StepRecord[] {
  return steps.reduce((acc, step) => {
    if (step.children) {
      acc.push(...flattenSteps(step.children as StepRecord[]));

      return acc;
    }

    acc.push(step);

    return acc;
  }, [] as StepRecord[]);
}

export function initStepperReducerState(
  initialSteps: StepRecord[],
  options?: {
    activeStepId?: string;
  },
) {
  const steps = autoStageSteps(initialSteps, options);
  const flatSteps = flattenSteps(steps);
  const started = !flatSteps.every((step) => step.stage === "pending");
  const ended = flatSteps.every((step) => step.stage === "completed");

  let activeStepIndex = flatSteps.findIndex((step) => step.stage === "active");

  if (activeStepIndex === -1 && ended) {
    activeStepIndex = flatSteps.length;
  }

  const activeStep = flatSteps[activeStepIndex] || null;
  const previousStep = flatSteps[activeStepIndex - 1] || null;
  const nextStep = flatSteps[activeStepIndex + 1] || null;

  return {
    steps,
    flatSteps,
    activeStep,
    previousStep,
    nextStep,
    activeStepIndex,
    ended,
    started,
  };
}
