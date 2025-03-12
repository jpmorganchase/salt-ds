import { type ReactNode, createContext, useContext } from "react";

import type { StepDepth } from "../Step";
import type { SteppedTrackerOrientation } from "../SteppedTracker";

export const DepthContext = createContext<StepDepth>(-1);
export const OrientationContext =
  createContext<SteppedTrackerOrientation>("horizontal");

export interface SteppedTrackerProviderProps {
  orientation: SteppedTrackerOrientation;
  children: ReactNode;
}

export function SteppedTrackerProvider({
  orientation: orientationProp,
  children,
}: SteppedTrackerProviderProps) {
  const depth = useContext(DepthContext);

  return (
    <OrientationContext.Provider value={orientationProp}>
      <DepthContext.Provider value={depth + 1}>
        {children}
      </DepthContext.Provider>
    </OrientationContext.Provider>
  );
}
