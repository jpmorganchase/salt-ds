import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  ReactNode,
  Children,
  useState,
  cloneElement,
  isValidElement,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";

import steppedTrackerCss from "./SteppedTracker.css";

import useDetectTruncatedText from "./useDetectTruncatedText";

const withBaseName = makePrefixer("saltSteppedTracker");

export interface SteppedTrackerProps extends ComponentPropsWithoutRef<"ul"> {
  /**
   * The index of the current activeStep
   */
  activeStep: number;
  /**
   * If `true`, the stepped tracker will be disabled.
   */
  disabled?: boolean;
  /**
   * Should be one or more <TrackerStep> components
   */
  children: ReactNode;
}

export const SteppedTracker = forwardRef<HTMLUListElement, SteppedTrackerProps>(
  function SteppedTracker(
    { children, className, disabled, activeStep, ...restProps },
    ref?
  ): ReactElement<SteppedTrackerProps> {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-stepped-tracker",
      css: steppedTrackerCss,
      window: targetWindow,
    });

    const [hasTooltips, setHasTooltips] = useState(false);

    const getOverflowRef = useDetectTruncatedText(setHasTooltips);

    const totalSteps = Children.count(children);

    return (
      <ul
        {...restProps}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
          },
          className
        )}
        {...restProps}
        ref={ref}
      >
        {Children.map(children, (child, i) => {
          if (!isValidElement(child)) {
            return child;
          }
          return cloneElement(child, {
            _isActive: activeStep === i,
            _hasConnector: i < totalSteps - 1,
            _overflowRef: getOverflowRef(i),
            _hasTooltip: hasTooltips,
            _totalSteps: totalSteps,
            _completed: activeStep > i,
            _disabled: disabled,
          });
        })}
      </ul>
    );
  }
);
