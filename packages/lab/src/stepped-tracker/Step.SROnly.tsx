import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { ReactNode } from "react";

import stepSROnlyCSS from "./Step.SROnly.css";

const withBaseName = makePrefixer("saltStepSROnly");

export namespace StepSROnly {
  export interface Props {
    children: ReactNode;
  }
}

export function StepSROnly({ children, ...props }: StepSROnly.Props) {
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
