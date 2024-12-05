import { type ReactNode, createContext, useContext } from "react";

import type { Step } from "./Step";
import type { SteppedTracker } from "./SteppedTracker";

export const DepthContext = createContext<Step.Depth>(-1);
export const OrientationContext =
  createContext<SteppedTracker.Orientation>("horizontal");

export namespace SteppedTrackerProvider {
  export interface Props {
    orientation: SteppedTracker.Orientation;
    children: ReactNode;
  }
}

export function SteppedTrackerProvider({
  orientation: orientationProp,
  children,
}: SteppedTrackerProvider.Props) {
  const depth = useContext(DepthContext);

  return (
    <OrientationContext.Provider value={orientationProp}>
      <DepthContext.Provider value={depth + 1}>
        {children}
      </DepthContext.Provider>
    </OrientationContext.Provider>
  );
}
