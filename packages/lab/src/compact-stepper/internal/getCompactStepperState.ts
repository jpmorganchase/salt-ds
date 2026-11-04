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
   * -1 when there are no steps.
   */
  currentIndex: number;
  current?: CompactStepperStep;
  /**
   * From 0 to 100.
   */
  progress: number;
  activeCount: number;
  hasNonStepChild: boolean;
}

function getCurrentIndex(steps: CompactStepperStep[]) {
  if (steps.length === 0) {
    return -1;
  }

  const activeIndex = steps.findIndex((step) => step.stage === "active");
  if (activeIndex !== -1) {
    return activeIndex;
  }

  const notCompletedIndex = steps.findIndex(
    (step) => step.stage !== "completed",
  );
  if (notCompletedIndex !== -1) {
    return notCompletedIndex;
  }

  return steps.length - 1;
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

  return {
    steps,
    currentIndex,
    current: currentIndex === -1 ? undefined : steps[currentIndex],
    progress:
      currentIndex === -1 ? 0 : ((currentIndex + 1) / steps.length) * 100,
    activeCount: steps.filter((step) => step.stage === "active").length,
    hasNonStepChild: flattened.length > elements.length,
  };
}
