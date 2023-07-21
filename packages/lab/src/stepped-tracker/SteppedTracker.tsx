import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  useState,
  isValidElement,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";

import useDetectTruncatedText from "./useDetectTruncatedText";
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
    { children, className, activeStep, ...restProps },
    ref?
  ): ReactElement<SteppedTrackerProps> {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepped-tracker",
      css: steppedTrackerCss,
      window: targetWindow,
    });

    useCheckInvalidChildren(children);
    const [hasTooltips, setHasTooltips] = useState(false);
    // A factory function used to get a callback ref for checking truncation.
    const getOverflowRef = useDetectTruncatedText(setHasTooltips);
    const totalSteps = Children.count(children);

    return (
      <SteppedTrackerProvider
        hasTooltips={hasTooltips}
        getOverflowRef={getOverflowRef}
        totalSteps={totalSteps}
        activeStep={activeStep}
      >
        <ul
          className={clsx(withBaseName(), className)}
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
