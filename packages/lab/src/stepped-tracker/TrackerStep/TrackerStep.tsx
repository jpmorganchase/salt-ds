import { makePrefixer } from "@salt-ds/core";
import {
  StepActiveIcon,
  StepDefaultIcon,
  StepSuccessIcon,
  WarningSolidIcon,
  ErrorSolidIcon,
} from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { TrackerConnector } from "../TrackerConnector";

import {
  useSteppedTrackerContext,
  useTrackerStepContext,
} from "../SteppedTrackerContext";

import trackerStepCss from "./TrackerStep.css";

const withBaseName = makePrefixer("saltTrackerStep");

type State = "default" | "completed" | "warning" | "error";

type StateWithActive = State | "active";

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * The state of the TrackerStep
   */
  state?: State;
}

const iconMap = {
  default: StepDefaultIcon,
  completed: StepSuccessIcon,
  warning: WarningSolidIcon,
  error: ErrorSolidIcon,
};

const getStateIcon = ({
  isActive,
  state,
}: {
  isActive: boolean;
  state: State;
}) => {
  if (state === "default" && isActive) {
    return StepActiveIcon;
  }
  return iconMap[state];
};

const getState = ({
  isActive,
  state,
}: {
  isActive: boolean;
  state: State;
}): StateWithActive => {
  if (state === "default" && isActive) {
    return "active";
  }
  return state;
};

const useCheckWithinSteppedTracker = (isWithinSteppedTracker: boolean) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      if (!isWithinSteppedTracker) {
        console.error(
          "The TrackerStep component must be placed within a SteppedTracker component",
        );
      }
    }
  }, [isWithinSteppedTracker]);
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(props, ref) {
    const {
      state = "default",
      style,
      className,
      children,
      ...restProps
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tracker-step",
      css: trackerStepCss,
      window: targetWindow,
    });

    const { activeStep, totalSteps, isWithinSteppedTracker } =
      useSteppedTrackerContext();
    const stepNumber = useTrackerStepContext();

    useCheckWithinSteppedTracker(isWithinSteppedTracker);

    const isActive = activeStep === stepNumber;
    const Icon = getStateIcon({ isActive, state });
    const resolvedState = getState({ isActive, state });
    const connectorState = activeStep > stepNumber ? "active" : "default";
    const hasConnector = stepNumber < totalSteps - 1;

    const innerStyle = {
      ...style,
      "--saltTrackerStep-width": `${100 / totalSteps}%`,
    };

    return (
      <li
        className={clsx(withBaseName(), withBaseName(resolvedState), className)}
        style={innerStyle}
        aria-current={isActive ? "step" : undefined}
        data-state={state}
        ref={ref}
        {...restProps}
      >
        <Icon />
        {hasConnector && <TrackerConnector state={connectorState} />}
        <div className={withBaseName("body")}>{children}</div>
      </li>
    );
  },
);
