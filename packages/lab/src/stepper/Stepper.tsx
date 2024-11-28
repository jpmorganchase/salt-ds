import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentProps,
  type ReactNode,
  forwardRef,
  useContext,
} from "react";

import { OrientationContext, StepperProvider } from "./Stepper.Provider";
import stepperCSS from "./Stepper.css";

export namespace Stepper {
  export interface Props extends ComponentProps<"ol"> {
    orientation?: Orientation;
    children: ReactNode;
  }

  export type Orientation = "horizontal" | "vertical";
}

const withBaseName = makePrefixer("saltStepper");

export const Stepper = forwardRef<HTMLOListElement, Stepper.Props>(
  function Stepper(
    { orientation: orientationProp, children, className, ...props },
    ref,
  ) {
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
