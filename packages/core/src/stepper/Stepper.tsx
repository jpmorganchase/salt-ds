import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { makePrefixer } from "../utils";
import StepperCSS from "./Stepper.css";
import {
  OrientationContext,
  StepperProvider,
} from "./internal/StepperProvider";

const withBaseName = makePrefixer("saltStepper");

export type StepperOrientation = "horizontal" | "vertical";

export interface StepperProps extends ComponentProps<"ol"> {
  orientation?: StepperOrientation;
  children: ReactNode;
}

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(
  function Stepper(
    { orientation: orientationProp, children, className, ...props },
    ref,
  ) {
    const targetWindow = useWindow();
    const orientationContext = useContext(OrientationContext);
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
