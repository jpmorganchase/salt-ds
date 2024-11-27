import { useReducer } from "react";

import { 
  autoStage,
  assignStage,
  flatten
} from "./utils";
import type { Step } from './Step';

export interface StepReducerState {
  steps: Step.Step[]
  flatSteps: Step.Step[]
  activeStep: Step.Props | null
  previousStep: Step.Props | null
  nextStep: Step.Props | null
  activeStepIndex: number
  completed: boolean
  started: boolean
}

export type StepReducerAction = 
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'error' }
  | { type: 'warning' }
  | { type: 'clear'}


function stepReducer(
  state: StepReducerState,
  action: StepReducerAction
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
        completed: false,
        started: true
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
      completed: true,
      started: true
    } as StepReducerState;
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
        completed: false,
        started: true
      } as StepReducerState
    }

    const activeStepIndex = -1;
    const activeStep = null;
    const previousStep = null;
    const nextStep = flatSteps[0];

    return {
      steps: assignStage(steps, 'pending'),
      flatSteps,
      activeStepIndex,
      activeStep,
      previousStep,
      nextStep,
      completed: false,
      started: false
    } as StepReducerState;
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

  return state;
}

export function useStepReducer(initialSteps: Step.Step[]) {
  const steps = autoStage(initialSteps);
  const flatSteps = flatten(steps);
  const activeStepIndex = flatSteps.findIndex(step => step.stage === 'active');
  const activeStep = flatSteps[activeStepIndex];
  const previousStep = flatSteps[activeStepIndex - 1] || null;
  const nextStep = flatSteps[activeStepIndex + 1] || null;
  const completed = flatSteps.every(step => step.stage === 'completed');
  const started = !flatSteps.every(step => step.stage === 'pending');

  const state: StepReducerState = {
    steps,
    flatSteps,
    activeStep,
    previousStep,
    nextStep,
    activeStepIndex,
    completed,
    started
  };

  return useReducer(stepReducer, state);
}


