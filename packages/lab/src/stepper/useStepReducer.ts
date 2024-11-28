import { useReducer } from "react";

import { 
  autoStage,
  assignStage,
  flatten
} from "./utils";
import type { Step } from './Step';

export namespace StepReducer {
  export interface State {
    steps: Step.Step[];
    flatSteps: Step.Step[];
    activeStep: Step.Step | null;
    previousStep: Step.Step | null;
    nextStep: Step.Step | null;
    activeStepIndex: number;
    started: boolean;
    ended: boolean;
  }

  export type Action =
    | { type: 'next' }
    | { type: 'previous' }
    | { type: 'error' }
    | { type: 'warning' }
    | { type: 'clear' }
}

function stepReducer(
  state: StepReducer.State,
  action: StepReducer.Action
) {
  if(action.type === 'next') {
    const steps = assignStage(state.steps);
    const flatSteps = flatten(steps);

    if(state.nextStep) {
      const activeStepIndex = state.activeStepIndex + 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = 'active';
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
      }
    }

    const activeStepIndex = flatSteps.length;
    const previousStep = flatSteps.at(-1)
    const activeStep = null;
    const nextStep = null;

    return {
      steps: assignStage(steps, 'completed'),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      started: true,
      ended: true,
    } as StepReducer.State;
  }

  if(action.type === 'previous') {
    const steps = assignStage(state.steps);
    const flatSteps = flatten(steps);

    if(state.previousStep) {
      const activeStepIndex = state.activeStepIndex - 1;
      const activeStep = flatSteps[activeStepIndex];
      const previousStep = flatSteps[activeStepIndex - 1] || null;
      const nextStep = flatSteps[activeStepIndex + 1] || null;

      if (activeStep) {
        activeStep.stage = 'active';
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
      } as StepReducer.State
    }

    const activeStepIndex = -1;
    const activeStep = null;
    const previousStep = null;
    const nextStep = flatSteps.at(0);

    return {
      steps: assignStage(steps, 'pending'),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      ended: false,
      started: false
    } as StepReducer.State;
  }

  if(action.type === 'error') {
    if(state.activeStep) {
      state.activeStep.status = 'error';
    }
  }

  if(action.type === 'warning') {
    if(state.activeStep) {
      state.activeStep.status = 'warning';
    }
  }

  if(action.type === 'clear') {
    if(state.activeStep) {
      state.activeStep.status = undefined;
    }
  }

  return {...state};
}

export function useStepReducer(initialSteps: Step.Step[]) {
  const steps = autoStage(initialSteps);
  const flatSteps = flatten(steps);
  const activeStepIndex = flatSteps.findIndex(step => step.stage === 'active');
  const activeStep = flatSteps[activeStepIndex];
  const previousStep = flatSteps[activeStepIndex - 1] || null;
  const nextStep = flatSteps[activeStepIndex + 1] || null;
  const started = !flatSteps.every(step => step.stage === 'pending');
  const ended = flatSteps.every(step => step.stage === 'completed');

  const state: StepReducer.State = {
    steps,
    flatSteps,
    activeStep,
    previousStep,
    nextStep,
    activeStepIndex,
    ended,
    started
  };

  return useReducer(stepReducer, state);
}


