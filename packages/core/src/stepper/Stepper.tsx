import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useContext } from "react";
import { makePrefixer } from "../utils";
import {
  StepperOrientationContext,
  StepperProvider,
} from "./internal/StepperProvider";
import StepperCSS from "./Stepper.css";

const withBaseName = makePrefixer("saltStepper");

export type StepperOrientation = "horizontal" | "vertical";

export interface StepperProps extends ComponentPropsWithoutRef<"ol"> {
  /**
   * The orientation of the stepper: defaults to horizontal.
   */
  orientation?: StepperOrientation;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  function Stepper(
    { orientation: orientationProp, children, className, ...props },
    ref,
  ) {
    const targetWindow = useWindow();
    const orientationContext = useContext(StepperOrientationContext);
    const orientation = orientationProp || orientationContext;

    useComponentCssInjection({
      testId: "salt-Stepper",
      css: StepperCSS,
      window: targetWindow,
    });

    return (
      <StepperProvider orientation={orientation}>
        <ol
          className={clsx(withBaseName(), withBaseName(orientation), className)}
          ref={ref}
          {...props}
        >
          {children}
        </ol>
      </StepperProvider>
    );
  },
);
