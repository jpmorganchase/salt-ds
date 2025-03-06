import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, useContext } from "react";
import { makePrefixer } from "../utils";

import {
  OrientationContext,
  SteppedTrackerProvider,
} from "./SteppedTracker.Provider";
import SteppedTrackerCSS from "./SteppedTracker.css";
import type { SteppedTrackerProps } from "./SteppedTracker.types";

const withBaseName = makePrefixer("saltSteppedTracker");

export const SteppedTracker = forwardRef<HTMLOListElement, SteppedTrackerProps>(
  function SteppedTracker(
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
  },
);
