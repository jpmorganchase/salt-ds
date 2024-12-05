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

import {
  OrientationContext,
  SteppedTrackerProvider,
} from "./SteppedTracker.Provider";
import SteppedTrackerCSS from "./SteppedTracker.css";

export namespace SteppedTracker {
  export interface Props extends ComponentProps<"ol"> {
    orientation?: Orientation;
    children: ReactNode;
  }

  export type Orientation = "horizontal" | "vertical";
}

const withBaseName = makePrefixer("saltSteppedTracker");

export const SteppedTracker = forwardRef<
  HTMLOListElement,
  SteppedTracker.Props
>(function SteppedTracker(
  { orientation: orientationProp, children, className, ...props },
  ref,
) {
  const targetWindow = useWindow();
  const orientationContext = useContext(OrientationContext);
  const orientation = orientationProp || orientationContext;

  useComponentCssInjection({
    testId: "salt-SteppedTracker",
    css: SteppedTrackerCSS,
    window: targetWindow,
  });

  return (
    <SteppedTrackerProvider orientation={orientation}>
      <ol
        className={clsx(withBaseName(), withBaseName(orientation), className)}
        ref={ref}
        {...props}
      >
        {children}
      </ol>
    </SteppedTrackerProvider>
  );
});
