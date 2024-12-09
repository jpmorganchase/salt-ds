import type { Step } from "./Step";
import type { StepReducer } from "./stepReducer";

export function assignSteps(
  steps: Step.Record[],
  stage?: Step.Stage,
): Step.Record[] {
  return steps.map((step) => {
    step.stage = stage;
    if (step.substeps) {
      step.substeps = assignSteps(step.substeps, stage);
    }

    return step;
  });
}

export function resetSteps(steps: Step.Record[]): Step.Record[] {
  return assignSteps(steps, undefined);
}

export function autoStageSteps(
  steps: Step.Record[],
  options?: StepReducer.Options,
): Step.Record[] {
  function autoStageHelper(steps: Step.Record[]): Step.Record[] | null {
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

      return [...previousSteps, activeStep, ...nextSteps] as Step.Record[];
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
      null as Step.Record[] | null,
    );
  }

  return (
    autoStageHelper(steps) || assignSteps(steps, steps[0].stage || "pending")
  );
}

export function flattenSteps(steps: Step.Record[]): Step.Record[] {
  return steps.reduce((acc, step) => {
    if (step.substeps) {
      acc.push(...flattenSteps(step.substeps));

      return acc;
    }

    acc.push(step);

    return acc;
  }, [] as Step.Record[]);
}

export function initStepReducerState(
  initialSteps: Step.Record[],
  options?: StepReducer.Options,
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
  } as StepReducer.State;
}
