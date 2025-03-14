import { type ReactNode, createContext, useContext } from "react";

import type { StepDepth } from "../Step";
import type { StepperOrientation } from "../Stepper";

export const DepthContext = createContext<StepDepth>(-1);
export const OrientationContext =
  createContext<StepperOrientation>("horizontal");

export interface StepperProviderProps {
  orientation: StepperOrientation;
  children: ReactNode;
}

export function StepperProvider({
  orientation: orientationProp,
  children,
}: StepperProviderProps) {
  const depth = useContext(DepthContext);

  return (
    <OrientationContext.Provider value={orientationProp}>
      <DepthContext.Provider value={depth + 1}>
        {children}
      </DepthContext.Provider>
    </OrientationContext.Provider>
  );
}
