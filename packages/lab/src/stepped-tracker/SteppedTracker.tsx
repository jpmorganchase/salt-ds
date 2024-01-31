import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  isValidElement,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";

import {
  SteppedTrackerProvider,
  TrackerStepProvider,
} from "./SteppedTrackerContext";

import steppedTrackerCss from "./SteppedTracker.css";

const withBaseName = makePrefixer("saltSteppedTracker");

export interface SteppedTrackerProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * The index of the current activeStep
   */
  activeStep: number;
  /**
   * Should be one or more TrackerStep components
   */
  children: ReactNode;
  /**
   * The orientation of the SteppedTracker. Defaults to `horizontal`
   */
  orientation?: "horizontal" | "vertical";
}

const useCheckInvalidChildren = (children: ReactNode) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      let hasInvalidChild = false;
      Children.forEach(children, (child) => {
        if (!isValidElement(child)) {
          hasInvalidChild = true;
        }
      });

      if (hasInvalidChild) {
        console.error(
          "Invalid child: children of SteppedTracker must be a TrackerStep component"
        );
      }
    }
  }, [children]);
};

export const SteppedTracker = forwardRef<HTMLUListElement, SteppedTrackerProps>(
  function SteppedTracker(
    {
      children,
      className,
      activeStep,
      orientation = "horizontal",
      ...restProps
    },
    ref
  ): ReactElement<SteppedTrackerProps> {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepped-tracker",
      css: steppedTrackerCss,
      window: targetWindow,
    });
    useCheckInvalidChildren(children);

    const totalSteps = Children.count(children);

    return (
      <SteppedTrackerProvider totalSteps={totalSteps} activeStep={activeStep}>
        <ul
          className={clsx(withBaseName(), className, withBaseName(orientation))}
          ref={ref}
          {...restProps}
        >
          {Children.map(children, (child, i) => (
            <TrackerStepProvider stepNumber={i}>{child}</TrackerStepProvider>
          ))}
        </ul>
      </SteppedTrackerProvider>
    );
  }
);
