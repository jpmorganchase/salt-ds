import { forwardRef, ComponentPropsWithoutRef } from "react";
import { clsx } from "clsx";
import { makePrefixer, Label } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepLabelCss from "./StepLabel.css";

const withBaseName = makePrefixer("saltStepLabel");

export type StepLabelProps = ComponentPropsWithoutRef<"label">;

export const StepLabel = forwardRef<HTMLLabelElement, StepLabelProps>(
  function StepLabel({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-step-label",
      css: stepLabelCss,
      window: targetWindow,
    });

    return (
      <Label className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        <strong>{children}</strong>
      </Label>
    );
  }
);
