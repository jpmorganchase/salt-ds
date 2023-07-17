import {
  forwardRef,
  ReactNode,
  useMemo,
  ComponentPropsWithoutRef,
} from "react";
import { clsx } from "clsx";
import { useForkRef, makePrefixer, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import stepLabelCss from "./StepLabel.css";

import { useSteppedTrackerContext } from "../SteppedTracker";

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

    const combinedRef = useForkRef(overflowRef, ref);

    return (
      <label
        className={clsx(withBaseName(), className)}
        ref={combinedRef as typeof overflowRef}
        {...rest}
      >
        {children}
      </label>
    );
  }
);
