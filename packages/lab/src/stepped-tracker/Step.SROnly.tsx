import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import stepSROnlyCSS from "./Step.SROnly.css";

const withBaseName = makePrefixer("saltStepSROnly");

export interface StepSROnlyProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

export function StepSROnly({ children, ...props }: StepSROnlyProps) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-sr-only",
    css: stepSROnlyCSS,
    window: targetWindow,
  });

  return (
    <div className={withBaseName()} {...props}>
      {children}
    </div>
  );
}
