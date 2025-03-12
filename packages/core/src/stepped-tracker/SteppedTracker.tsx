import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, useContext } from "react";
import type { ComponentProps, ReactNode } from "react";
import { makePrefixer } from "../utils";
import {
  OrientationContext,
  SteppedTrackerProvider,
} from "./internal/SteppedTrackerProvider";
import SteppedTrackerCSS from "./SteppedTracker.css";

const withBaseName = makePrefixer("saltSteppedTracker");

export type SteppedTrackerOrientation = "horizontal" | "vertical";

export interface SteppedTrackerProps extends ComponentProps<"ol"> {
  orientation?: SteppedTrackerOrientation;
  children: ReactNode;
}

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
