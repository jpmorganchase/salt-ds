import type { StepRecord } from ".";

export interface StepReducerState {
  steps: StepRecord[];
  flatSteps: StepRecord[];
  activeStep: StepRecord | null;
  previousStep: StepRecord | null;
  nextStep: StepRecord | null;
  activeStepIndex: number;
  started: boolean;
  ended: boolean;
}

export type StepReducerAction =
  | { type: "next" }
  | { type: "previous" }
  | { type: "error" }
  | { type: "warning" }
  | { type: "clear" };

export interface StepReducerOptions {
  activeStepId?: string;
}
