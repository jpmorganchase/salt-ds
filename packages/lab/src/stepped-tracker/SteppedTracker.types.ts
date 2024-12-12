import type { ComponentProps, ReactNode } from "react";

export interface SteppedTrackerProps extends ComponentProps<"ol"> {
  orientation?: SteppedTrackerOrientation;
  children: ReactNode;
}

export type SteppedTrackerOrientation = "horizontal" | "vertical";
