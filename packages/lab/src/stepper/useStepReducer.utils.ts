import type { Step } from "./Step";

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
  options?: {
    activeStepId?: string;
  },
): Step.Props[] {
  function autoStageHelper(steps: Step.Props[]): Step.Props[] | null {
    const pivotIndex = steps.findIndex(
      (step) =>
        step.id === options?.activeStepId ||
        step.stage === "active" ||
        step.stage === "inprogress",
    );

    if (pivotIndex !== -1) {
      const activeStep = steps[pivotIndex];

      if (!activeStep.stage) {
        activeStep.stage = "active";
      }

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

  return autoStageHelper(steps) || [...steps];
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
