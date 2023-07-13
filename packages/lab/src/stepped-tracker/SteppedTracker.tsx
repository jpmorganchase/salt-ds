import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  useState,
  isValidElement,
  useEffect,
  createContext,
  useContext,
  useMemo,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";

import steppedTrackerCss from "./SteppedTracker.css";

import useDetectTruncatedText, {
  GetOverflowRef,
} from "./useDetectTruncatedText";

export type SteppedTrackerContextType = {
  activeStep: number;
  getOverflowRef: GetOverflowRef;
  hasTooltips: boolean;
  totalSteps: number;
  isWithinSteppedTracker: boolean;
};

const defaultSteppedTrackerContext = {
  activeStep: 0,
  hasTooltips: false,
  totalSteps: 1,
  getOverflowRef: () => undefined,
  isWithinSteppedTracker: false,
};

const SteppedTrackerContext = createContext(
  defaultSteppedTrackerContext as unknown as SteppedTrackerContextType
);

export const useSteppedTrackerContext = () => useContext(SteppedTrackerContext);

type TrackerStepNumberContextType = number;

const TrackerStepContext = createContext<TrackerStepNumberContextType>(0);

export const useTrackerStepContext = () => useContext(TrackerStepContext);

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

    const steppedTrackerContextValue: SteppedTrackerContextType = useMemo(
      () => ({
        activeStep,
        getOverflowRef,
        hasTooltips,
        totalSteps,
        isWithinSteppedTracker: true,
      }),
      [activeStep, getOverflowRef, hasTooltips, totalSteps]
    );

    return (
      <SteppedTrackerContext.Provider value={steppedTrackerContextValue}>
        <ul
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...restProps}
        >
          {Children.map(children, (child, i) => (
            <TrackerStepContext.Provider value={i}>
              {child}
            </TrackerStepContext.Provider>
          ))}
        </ul>
      </SteppedTrackerContext.Provider>
    );
  }
);
