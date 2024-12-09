import type { Step } from "./Step";
import { assignSteps, autoStageSteps, flattenSteps, resetSteps } from "./utils";

export namespace StepReducer {
  export interface State {
    steps: Step.Record[];
    flatSteps: Step.Record[];
    activeStep: Step.Record | null;
    previousStep: Step.Record | null;
    nextStep: Step.Record | null;
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
  };
}

/**
 * Extracts all step ids from a array of steps,
 * including top and lower levels.
 *
 * I can't use this type because our codebase
 * is running below TypeScript 5, where "const"
 * in function generics was firstly introduced.
 * */
export type AllowedActiveStepIds<
  S extends Step.Record[],
  Acc extends string = never,
> = S extends [{ id: infer ID; substeps?: infer SS }, ...infer R]
  ? ID extends string
    ? R extends Step.Record[]
      ? SS extends Step.Record[]
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
