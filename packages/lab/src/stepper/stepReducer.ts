import type { Step } from "./Step";
import { assignSteps, autoStageSteps, flattenSteps, resetSteps } from "./utils";

export namespace StepReducer {
  export interface State {
    steps: Step.Props[];
    flatSteps: Step.Props[];
    activeStep: Step.Props | null;
    previousStep: Step.Props | null;
    nextStep: Step.Props | null;
    activeStepIndex: number;
    started: boolean;
    ended: boolean;
  }

  export type Action =
    | { type: "next" }
    | { type: "previous" }
    | { type: "error" }
    | { type: "warning" }
    | { type: "clear" };

  export type Options = {
    activeStepId?: string;
    started?: boolean;
    ended?: boolean;
  };
}

/**
 * Extracts all step ids from a array of
 * steps, including top and lower levels.
 *
 * I can't use this type because our codebase
 * because const in the type definition is not
 * supported by the current version of TypeScript.
 * */
export type AllowedActiveStepIds<
  S extends Step.Props[],
  Acc extends string = never,
> = S extends [{ id: infer ID; substeps?: infer SS }, ...infer R]
  ? ID extends string
    ? R extends Step.Props[]
      ? SS extends Step.Props[]
        ? AllowedActiveStepIds<R, Acc | AllowedActiveStepIds<SS>>
        : AllowedActiveStepIds<R, Acc | ID>
      : Acc
    : Acc
  : Acc;

export default function stepReducer(
  state: StepReducer.State,
  action: StepReducer.Action,
) {
  if (action.type === "next") {
    if (state.activeStep?.status === "error") {
      return state;
    }

    const steps = resetSteps(state.steps);
    const flatSteps = flattenSteps(steps);

    if (state.nextStep) {
      const activeStepIndex = state.activeStepIndex + 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = "active";
      }

      return {
        steps: autoStageSteps(steps),
        flatSteps,
        activeStepIndex,
        activeStep,
        previousStep,
        nextStep,
        started: true,
        ended: false,
      };
    }

    const activeStepIndex = flatSteps.length;
    const previousStep = flatSteps.at(-1);
    const activeStep = null;
    const nextStep = null;

    return {
      steps: assignSteps(steps, "completed"),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      started: true,
      ended: true,
    } as StepReducer.State;
  }

  if (action.type === "previous") {
    if (state.activeStep?.status === "error") {
      return state;
    }

    const steps = resetSteps(state.steps);
    const flatSteps = flattenSteps(steps);

    if (state.previousStep) {
      const activeStepIndex = state.activeStepIndex - 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = "active";
      }

      return {
        steps: autoStageSteps(steps),
        flatSteps,
        activeStepIndex,
        activeStep,
        previousStep,
        nextStep,
        started: true,
        ended: false,
      } as StepReducer.State;
    }

    const activeStepIndex = -1;
    const activeStep = null;
    const previousStep = null;
    const nextStep = flatSteps.at(0);

    return {
      steps: assignSteps(steps, "pending"),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      ended: false,
      started: false,
    } as StepReducer.State;
  }

  if (action.type === "error") {
    if (state.activeStep) {
      state.activeStep.status = "error";
      return { ...state };
    }
  }

  if (action.type === "warning") {
    if (state.activeStep) {
      state.activeStep.status = "warning";
      return { ...state };
    }
  }

  if (action.type === "clear") {
    if (state.activeStep) {
      state.activeStep.status = undefined;
      return { ...state };
    }
  }

  return state;
}
