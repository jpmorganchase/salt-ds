import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  useState,
  cloneElement,
  isValidElement,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import { TrackerStep } from "./TrackerStep";

import steppedTrackerCss from "./SteppedTracker.css";

import useDetectTruncatedText from "./useDetectTruncatedText";

const withBaseName = makePrefixer("saltSteppedTracker");

export interface SteppedTrackerProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * The index of the current activeStep
   */
  activeStep: number;
  /**
   * Should be one or more <TrackerStep> components
   */
  children: ReactNode;
}

const useCheckInvalidChildren = (children: ReactNode) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      let hasInvalidChild = false;
      Children.forEach(children, (child) => {
        if (!isValidElement(child) || child.type !== TrackerStep) {
          hasInvalidChild = true;
        }
      });

      if (hasInvalidChild) {
        console.error(
          "Invalid children: children of <SteppedTracker> must be a <TrackerStep> component"
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
      <ul {...restProps} className={clsx(withBaseName(), className)} ref={ref}>
        {Children.map(children, (child, i) => {
          if (!isValidElement(child)) {
            return child;
          }

          return cloneElement(child, {
            _activeStep: activeStep,
            _overflowRef: getOverflowRef(i),
            _hasTooltip: hasTooltips,
            _totalSteps: totalSteps,
            _stepNumber: i,
          });
        })}
      </ul>
    );
  }
);
