import { createContext, type ReactNode, useContext } from "react";

import type { StepDepth } from "../Step";
import type { StepperOrientation } from "../Stepper";

export const StepperOrientationContext =
  createContext<StepperOrientation>("horizontal");
export const StepDepthContext = createContext<StepDepth>(-1);

export interface StepperProviderProps {
  /**
   * The orientation of the stepper, which the steps inside it and nested
   * steppers read from context.
   */
  orientation: StepperOrientation;
  /**
   * The content of the stepper. Steps inside it get a depth one more than the
   * steps of the surrounding stepper, starting at `0`.
   */
  children: ReactNode;
}

export function StepperProvider({
  orientation: orientationProp,
  children,
}: StepperProviderProps) {
  const depth = useContext(StepDepthContext);

  return (
    <StepperOrientationContext.Provider value={orientationProp}>
      <StepDepthContext.Provider value={depth + 1}>
        {children}
      </StepDepthContext.Provider>
    </StepperOrientationContext.Provider>
  );
}
