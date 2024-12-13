import type { StepRecord, StepStage } from "./Step.types";
import type { StepReducerOptions, StepReducerState } from "./stepReducer.types";

export function assignSteps(
  steps: StepRecord[],
  stage?: StepStage,
): StepRecord[] {
  return steps.map((step) => {
    step.stage = stage;
    if (step.substeps) {
      step.substeps = assignSteps(step.substeps, stage);
    }

    return step;
  });
}

export function resetSteps(steps: StepRecord[]): StepRecord[] {
  return assignSteps(steps, undefined);
}

export function autoStageSteps(
  steps: StepRecord[],
  options?: StepReducerOptions,
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

      const previousSteps = assignSteps(
        steps.slice(0, pivotIndex),
        "completed",
      );
      const nextSteps = assignSteps(steps.slice(pivotIndex + 1), "pending");

      return [...previousSteps, activeStep, ...nextSteps] as StepRecord[];
    }

    return steps.reduce(
      (acc, step, index) => {
        if (step.substeps) {
          const substeps = autoStageHelper(step.substeps);

          if (substeps) {
            steps[index].substeps = substeps;
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
    autoStageHelper(steps) || assignSteps(steps, steps[0].stage || "pending")
  );
}

export function flattenSteps(steps: StepRecord[]): StepRecord[] {
  return steps.reduce((acc, step) => {
    if (step.substeps) {
      acc.push(...flattenSteps(step.substeps));

      return acc;
    }

    acc.push(step);

    return acc;
  }, [] as StepRecord[]);
}

export function initStepReducerState(
  initialSteps: StepRecord[],
  options?: StepReducerOptions,
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
  } as StepReducerState;
}
