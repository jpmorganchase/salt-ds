import { type ReactNode, createContext, useContext } from "react";

import type { Step } from "./Step";
import type { Stepper } from "./Stepper";

export const DepthContext = createContext<Step.Depth>(-1);
export const OrientationContext =
  createContext<Stepper.Orientation>("horizontal");

export namespace StepperProvider {
  export interface Props {
    orientation: Stepper.Orientation;
    children: ReactNode;
  }
}

export function StepperProvider({
  orientation: orientationProp,
  children,
}: StepperProvider.Props) {
  const depth = useContext(DepthContext);

  return (
    <OrientationContext.Provider value={orientationProp}>
      <DepthContext.Provider value={depth + 1}>
        {children}
      </DepthContext.Provider>
    </OrientationContext.Provider>
  );
}
