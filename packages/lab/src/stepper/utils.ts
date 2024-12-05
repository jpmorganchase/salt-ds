import type { Step } from "./Step";
import type { StepReducer } from "./stepReducer";

export function assignSteps(
  steps: Step.Props[],
  stage?: Step.Stage,
): Step.Props[] {
  return steps.map((step) => {
    step.stage = stage;
    if (step.substeps) {
      step.substeps = assignSteps(step.substeps, stage);
    }

    return step;
  });
}

export function resetSteps(steps: Step.Props[]): Step.Props[] {
  return assignSteps(steps, undefined);
}

export function autoStageSteps(
  steps: Step.Props[],
  options?: StepReducer.Options,
): Step.Props[] {
  if (options?.started === false) {
    return assignSteps(steps, "pending");
  }

  if (options?.ended === true) {
    return assignSteps(steps, "completed");
  }

  function autoStageHelper(steps: Step.Props[]): Step.Props[] | null {
    const pivotIndex = steps.findIndex(
      (step) =>
        step.id === options?.activeStepId ||
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

      return [...previousSteps, activeStep, ...nextSteps] as Step.Props[];
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
      null as Step.Props[] | null,
    );
  }

  return autoStageHelper(steps) || steps;
}

export function flattenSteps(steps: Step.Props[]): Step.Props[] {
  return steps.reduce((acc, step) => {
    if (step.substeps) {
      acc.push(...flattenSteps(step.substeps));

      return acc;
    }

    acc.push(step);

    return acc;
  }, [] as Step.Props[]);
}

export function initStepReducerState(
  initialSteps: Step.Props[],
  options?: StepReducer.Options,
) {
  const steps = autoStageSteps(initialSteps, options);
  const flatSteps = flattenSteps(steps);

  let activeStepIndex = flatSteps.findIndex((step) => step.stage === "active");

  if (options?.started === false) {
    activeStepIndex = -1;
  }

  if (options?.ended === true) {
    activeStepIndex = flatSteps.length;
  }

  const activeStep = flatSteps[activeStepIndex] || null;
  const previousStep = flatSteps[activeStepIndex - 1] || null;
  const nextStep = flatSteps[activeStepIndex + 1] || null;
  const started = !flatSteps.every((step) => step.stage === "pending");
  const ended = flatSteps.every((step) => step.stage === "completed");

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
