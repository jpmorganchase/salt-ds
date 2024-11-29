import type { Step } from "./Step";
import type { Stepper } from "./Stepper";

export * from "./Stepper";
export * from "./Step";
export * from "./useSteppedReducer";

export interface StepperProps extends Stepper.Props {}
export interface StepProps extends Step.Props {}

export type StepperOrientation = Stepper.Orientation;
export type StepStatus = Step.Status;
export type StepStage = Step.Stage;
