import {
  forwardRef,
  useContext,
  type ReactNode,
  type ComponentProps,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepperCSS from "./Stepper.css";
import { StepperProvider, OrientationContext } from "./Stepper.Provider";

export namespace Stepper {
  export interface Props extends ComponentProps<"ol"> {
    orientation?: Orientation;
    children: ReactNode;
  }

  export type Orientation = 
    | "horizontal"
    | "vertical"
  ;
}

const withBaseName = makePrefixer("saltStepper");

export const Stepper = forwardRef<HTMLOListElement, Stepper.Props>(
  function Stepper({
    orientation: orientationProp,
    children,
    className,
    ...props
  }, ref) {
    const targetWindow = useWindow();
    const orientationContext = useContext(OrientationContext);
    const orientation = orientationProp || orientationContext;

    useComponentCssInjection({
      testId: "salt-stepper",
      css: stepperCSS,
      window: targetWindow,
    });

    return (
      <StepperProvider orientation={orientation}>
        <ol
          className={clsx(
            withBaseName(),
            withBaseName(orientation),
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </ol>
      </StepperProvider>
    );
  },
);
