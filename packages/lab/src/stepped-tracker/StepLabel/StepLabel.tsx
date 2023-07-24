import {
  forwardRef,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { clsx } from "clsx";
import { makePrefixer, Label } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepLabelCss from "./StepLabel.css";

import { useTrackerStepTooltipContext } from "../TrackerStep";

const withBaseName = makePrefixer("saltStepLabel");

export interface StepLabelProps extends ComponentPropsWithoutRef<"label"> {
  children: ReactNode;
}

export const StepLabel = forwardRef<HTMLLabelElement, StepLabelProps>(
  function StepLabel({ children, className, ...rest }, ref?) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-step-label",
      css: stepLabelCss,
      window: targetWindow,
    });

    const isInTooltip = useTrackerStepTooltipContext();

    return isInTooltip ? (
      <span>{children}</span>
    ) : (
      <Label
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      >
        {children}
      </Label>
    );
  }
);
