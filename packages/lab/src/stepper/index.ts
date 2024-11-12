import { Step } from './Step';
import { Stepper } from './Stepper';

export * from './Stepper';
export * from './Step';

export interface StepperProps extends Stepper.Props {};
export interface StepProps extends Step.Props {}

export type StepperOrientation = Stepper.Orientation;
export type StepStatus = Step.Status;
export type StepStage = Step.Stage;