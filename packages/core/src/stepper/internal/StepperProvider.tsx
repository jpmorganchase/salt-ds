import { createContext, type ReactNode, useContext } from "react";

import type { StepDepth } from "../Step";
import type { StepperOrientation } from "../Stepper";

export const StepperOrientationContext =
  createContext<StepperOrientation>("horizontal");
export const StepDepthContext = createContext<StepDepth>(-1);

export interface StepperProviderProps {
  orientation: StepperOrientation;
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
