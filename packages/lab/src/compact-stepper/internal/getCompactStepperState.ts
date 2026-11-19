import type { StepStatus } from "@salt-ds/core";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  CompactStep,
  type CompactStepProps,
  type CompactStepStage,
} from "../CompactStep";

export interface CompactStepperStep {
  element: ReactElement<CompactStepProps>;
  stage: CompactStepStage;
  status?: StepStatus;
}

export interface CompactStepperState {
  steps: CompactStepperStep[];
  /**
   * Index of the first active or locked step, otherwise of the first pending step, or of the last step when every step is completed. `-1` when there are no steps.
   */
  currentIndex: number;
  current?: CompactStepperStep;
  /**
   * Percentage of the bar to fill, up to and including the current step. A pending current step isn't filled.
   */
  progress: number;
  /**
   * Number of steps that are active or locked.
   */
  currentCount: number;
  hasNonStepChild: boolean;
}

function isCurrentStep(step: CompactStepperStep) {
  return step.stage === "active" || step.stage === "locked";
}

function getCurrentIndex(steps: CompactStepperStep[]) {
  const currentIndex = steps.findIndex(isCurrentStep);
  if (currentIndex !== -1) {
    return currentIndex;
  }

  const nextIndex = steps.findIndex((step) => step.stage !== "completed");
  return nextIndex !== -1 ? nextIndex : steps.length - 1;
}

function isFragmentElement(
  child: ReactNode,
): child is ReactElement<{ children?: ReactNode }> {
  return (
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
  );
}

function isCompactStepElement(
  child: ReactNode,
): child is ReactElement<CompactStepProps> {
  return isValidElement<CompactStepProps>(child) && child.type === CompactStep;
}

function flattenChildren(children: ReactNode): ReactNode[] {
  const flattened: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (isFragmentElement(child)) {
      flattened.push(...flattenChildren(child.props.children));
    } else if (
      child !== null &&
      child !== undefined &&
      typeof child !== "boolean"
    ) {
      flattened.push(child);
    }
  });

  return flattened;
}

export function getCompactStepperState(
  children: ReactNode,
): CompactStepperState {
  const flattened = flattenChildren(children);
  const elements = flattened.filter(isCompactStepElement);

  const steps = elements.map((element) => {
    const { stage = "pending", status } = element.props;
    return { element, stage, status };
  });

  const currentIndex = getCurrentIndex(steps);
  const current = currentIndex === -1 ? undefined : steps[currentIndex];
  const filledSteps =
    current?.stage === "pending" ? currentIndex : currentIndex + 1;

  return {
    steps,
    currentIndex,
    current,
    progress: current ? (filledSteps / steps.length) * 100 : 0,
    currentCount: steps.filter(isCurrentStep).length,
    hasNonStepChild: flattened.length > elements.length,
  };
}
