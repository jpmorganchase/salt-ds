import {
  forwardRef,
  ReactNode,
  useMemo,
  ComponentPropsWithoutRef,
} from "react";
import { clsx } from "clsx";
import { useForkRef, makePrefixer, useIdMemo, Label } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepLabelCss from "./StepLabel.css";

import { useSteppedTrackerContext } from "../SteppedTrackerContext";
import { useTrackerStepTooltipContext } from "../TrackerStep";

const withBaseName = makePrefixer("saltStepLabel");

export interface StepLabelProps extends ComponentPropsWithoutRef<"label"> {
  children: ReactNode;
}

export const StepLabel = forwardRef<HTMLLabelElement, StepLabelProps>(
  function StepLabel({ children, className, ...rest }, ref?) {
    const id = useIdMemo();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-step-label",
      css: stepLabelCss,
      window: targetWindow,
    });

    const { getOverflowRef } = useSteppedTrackerContext();
    const overflowRef = useMemo(() => getOverflowRef(id), [id, getOverflowRef]);

    const isInTooltip = useTrackerStepTooltipContext();

    const combinedRef = useForkRef<HTMLLabelElement>(overflowRef, ref);

    return isInTooltip ? (
      <span>{children}</span>
    ) : (
      <Label
        className={clsx(withBaseName(), className)}
        ref={combinedRef}
        {...rest}
      >
        {children}
      </Label>
    );
  }
);
