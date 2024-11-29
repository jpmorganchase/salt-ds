import type { Step } from "./Step";
import type { Stepper } from "./Stepper";
import type { SteppedReducer } from "./useSteppedReducer";

export * from "./Stepper";
export interface StepperProps extends Stepper.Props {}
export type StepperOrientation = Stepper.Orientation;

export * from "./Step";
export interface StepProps extends Step.Props {}
export type StepStatus = Step.Status;
export type StepStage = Step.Stage;
export type StepDepth = Step.Depth;

export * from "./useSteppedReducer";
export type SteppedReducerState = SteppedReducer.State;
export type SteppedReducerAction = SteppedReducer.Action;
