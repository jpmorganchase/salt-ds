import {
  Step,
  type StepProps,
  type StepStage,
  type StepStatus,
} from "@salt-ds/core";
import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export interface CompactStepperStep {
  label?: ReactNode;
  stage: StepStage;
  status?: StepStatus;
}

export interface CompactStepperState {
  steps: CompactStepperStep[];
  /**
   * The first active or locked step, or the last step when every step is completed.
   * -1 otherwise.
   */
  currentIndex: number;
  current?: CompactStepperStep;
  /**
   * From 0 to 100.
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

function isFinishedProcess(steps: CompactStepperStep[]) {
  return steps.length > 0 && steps.every((step) => step.stage === "completed");
}

function getCurrentIndex(steps: CompactStepperStep[]) {
  const currentIndex = steps.findIndex(isCurrentStep);
  if (currentIndex !== -1) {
    return currentIndex;
  }

  // A finished process shows its last step.
  return isFinishedProcess(steps) ? steps.length - 1 : -1;
}

function isFragmentElement(
  child: ReactNode,
): child is ReactElement<{ children?: ReactNode }> {
  return (
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
  );
}

function isStepElement(child: ReactNode): child is ReactElement<StepProps> {
  return isValidElement<StepProps>(child) && child.type === Step;
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
  const elements = flattened.filter(isStepElement);

  const steps = elements.map((element) => {
    const { label, stage = "pending", status } = element.props;
    return { label, stage, status };
  });

  const currentIndex = getCurrentIndex(steps);
  const isFinished = isFinishedProcess(steps);

  return {
    steps,
    currentIndex,
    current: currentIndex === -1 ? undefined : steps[currentIndex],
    // Only completed steps fill the bar; the current step isn't completed yet.
    progress: isFinished
      ? 100
      : currentIndex === -1
        ? 0
        : (currentIndex / steps.length) * 100,
    currentCount: steps.filter(isCurrentStep).length,
    hasNonStepChild: flattened.length > elements.length,
  };
}
