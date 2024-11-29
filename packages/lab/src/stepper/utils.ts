import type { Step } from "./Step";

export function assignStage(
  steps: Step.Props[],
  stage?: Step.Stage,
): Step.Props[] {
  return steps.map((step) => {
    step.stage = stage;
    if (step.substeps) {
      step.substeps = assignStage(step.substeps, stage);
    }

    return step;
  });
}

export function autoStage(steps: Step.Props[]): Step.Props[] {
  function autoStageHelper(steps: Step.Props[]): Step.Props[] | null {
    const pivotIndex = steps.findIndex(
      (step) => step.stage === "active" || step.stage === "inprogress",
    );

    if (pivotIndex !== -1) {
      const activeStep = steps[pivotIndex] as Step.Props;
      const previousSteps = assignStage(
        steps.slice(0, pivotIndex),
        "completed",
      );
      const nextSteps = assignStage(steps.slice(pivotIndex + 1), "pending");

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

  return autoStageHelper(steps) || assignStage(steps, "pending");
}

export function flatten(steps: Step.Props[]): Step.Props[] {
  return steps.reduce((acc, step) => {
    if (step.substeps) {
      acc.push(...flatten(step.substeps));

      return acc;
    }

    acc.push(step);

    return acc;
  }, [] as Step.Props[]);
}
