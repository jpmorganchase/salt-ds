import { useReducer } from "react";

import type { Step } from "./Step";
import { assignStage, autoStage, flatten } from "./utils";

export namespace SteppedReducer {
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
}

function steppedReducer(
  state: SteppedReducer.State,
  action: SteppedReducer.Action,
) {
  if (action.type === "next") {
    const steps = assignStage(state.steps);
    const flatSteps = flatten(steps);

    if (state.nextStep) {
      const activeStepIndex = state.activeStepIndex + 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = "active";
      }

      return {
        steps: autoStage(steps),
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
      steps: assignStage(steps, "completed"),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      started: true,
      ended: true,
    } as SteppedReducer.State;
  }

  if (action.type === "previous") {
    const steps = assignStage(state.steps);
    const flatSteps = flatten(steps);

    if (state.previousStep) {
      const activeStepIndex = state.activeStepIndex - 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = "active";
      }

      return {
        steps: autoStage(steps),
        flatSteps,
        activeStepIndex,
        activeStep,
        previousStep,
        nextStep,
        started: true,
        ended: false,
      } as SteppedReducer.State;
    }

    const activeStepIndex = -1;
    const activeStep = null;
    const previousStep = null;
    const nextStep = flatSteps.at(0);

    return {
      steps: assignStage(steps, "pending"),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      ended: false,
      started: false,
    } as SteppedReducer.State;
  }

  if (action.type === "error") {
    if (state.activeStep) {
      state.activeStep.status = "error";
    }
  }

  if (action.type === "warning") {
    if (state.activeStep) {
      state.activeStep.status = "warning";
    }
  }

  if (action.type === "clear") {
    if (state.activeStep) {
      state.activeStep.status = undefined;
    }
  }

  return { ...state };
}

export function useSteppedReducer(initialSteps: Step.Props[]) {
  const steps = autoStage(initialSteps);
  const flatSteps = flatten(steps);
  const activeStepIndex = flatSteps.findIndex(
    (step) => step.stage === "active",
  );
  const activeStep = flatSteps[activeStepIndex];
  const previousStep = flatSteps[activeStepIndex - 1] || null;
  const nextStep = flatSteps[activeStepIndex + 1] || null;
  const started = !flatSteps.every((step) => step.stage === "pending");
  const ended = flatSteps.every((step) => step.stage === "completed");

  const state: SteppedReducer.State = {
    steps,
    flatSteps,
    activeStep,
    previousStep,
    nextStep,
    activeStepIndex,
    ended,
    started,
  };

  return useReducer(steppedReducer, state);
}
