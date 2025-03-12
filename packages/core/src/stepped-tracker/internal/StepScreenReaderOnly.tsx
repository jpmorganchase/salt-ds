import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { makePrefixer } from "../../utils";

import stepSROnlyCSS from "./StepScreenReaderOnly.css";

const withBaseName = makePrefixer("saltStepScreenReaderOnly");

export interface StepScreenReaderOnlyProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

export function StepScreenReaderOnly({ children, ...props }: StepScreenReaderOnlyProps) {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-step-screen-reader-only",
    css: stepSROnlyCSS,
    window: targetWindow,
  });

  return (
    <div className={withBaseName()} {...props}>
      {children}
    </div>
  );
}
