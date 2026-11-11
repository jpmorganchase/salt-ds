import { Children, isValidElement, type ReactNode } from "react";
import type { StepStage } from "../Step";

interface StepElementProps {
  stage?: StepStage;
  children?: ReactNode;
}

export function hasActiveStep(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<StepElementProps>(child) &&
      (child.props.stage === "active" || hasActiveStep(child.props.children)),
  );
}
