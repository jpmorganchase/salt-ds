import type { StepReducerAction, StepReducerState } from "./stepReducer.types";
import { assignSteps, autoStageSteps, flattenSteps, resetSteps } from "./utils";

export default function stepReducer(
  state: StepReducerState,
  action: StepReducerAction,
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
    } as StepReducerState;
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
      } as StepReducerState;
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
    } as StepReducerState;
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
