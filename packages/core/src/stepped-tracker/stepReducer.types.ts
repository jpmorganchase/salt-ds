import type { StepRecord } from ".";

export interface StepReducerState {
  steps: StepRecord[];
  flatSteps: StepRecord[];
  activeStepIndex: number;
  activeStep: StepRecord | null;
  previousStep: StepRecord | null;
  nextStep: StepRecord | null;
  started: boolean;
  ended: boolean;
}

export type StepReducerAction =
  | { type: "next" }
  | { type: "previous" }
  | { type: "reset" }
  | { type: "status/error" }
  | { type: "status/warning" }
  | { type: "status/clear" };

export interface StepReducerOptions {
  activeStepId?: string;
}
