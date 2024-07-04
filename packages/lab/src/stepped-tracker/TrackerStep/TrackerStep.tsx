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

type StageOptions = "pending" | "completed";
type StatusOptions = "warning" | "error" | undefined;

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * The slug of the icon to be displayed in the TrackerStep
   */
  stage?: StageOptions;
  status?: StatusOptions;
}

const iconMap = {
  pending: StepDefaultIcon,
  active: StepActiveIcon,
  completed: StepSuccessIcon,
  warning: WarningSolidIcon,
  error: ErrorSolidIcon,
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

const parseState = (
  stage: StageOptions,
  status: StatusOptions,
  active: boolean
) => {
  if (stage === "completed") return "completed";
  if (active) return "active";
  if (status) return status;
  return stage;
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(props, ref) {
    const {
      stage = "pending",
      status,
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
    const state = parseState(stage, status, isActive);

    const Icon = iconMap[state];
    const connectorState = activeStep > stepNumber ? "active" : "default";
    const hasConnector = stepNumber < totalSteps - 1;

    const innerStyle = {
      ...style,
      "--saltTrackerStep-width": `${100 / totalSteps}%`,
    };

    return (
      <li
        className={clsx(withBaseName(), withBaseName(state), className)}
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
