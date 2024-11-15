import {
  forwardRef,
  type ReactNode,
  type ComponentProps,
  useContext,
} from "react";
import { clsx } from "clsx";

import { makePrefixer } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import stepperCSS from "./Stepper.css";
import { OrientationContext, StepperProvider } from "./StepperProvider";

export namespace Stepper {
  export interface Props extends ComponentProps<"ol"> {
    orientation?: Orientation;
    className?: string;
    children: ReactNode;
  }

  export type Orientation = 
    | "horizontal"
    | "vertical"
  ;
}

export interface StepperProps extends Stepper.Props {}

const withBaseName = makePrefixer("saltStepper");

export const Stepper = forwardRef<HTMLOListElement, Stepper.Props>(
  function Stepper({
    className = "",
    orientation: orientationProp,
    children,
    ...props
  }, ref) {
    const targetWindow = useWindow();
    const orientationContext = useContext(OrientationContext);

    const orientation = (
      orientationProp
      || orientationContext 
      || 'horizontal'
    )

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
