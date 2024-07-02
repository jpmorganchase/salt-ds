import { ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer } from "@salt-ds/core";
import {
  StepActiveIcon,
  StepDefaultIcon,
  StepSuccessIcon,
  WarningSolidIcon,
  ErrorSolidIcon,
} from "@salt-ds/icons";
import { TrackerConnector } from "../TrackerConnector";

import {
  useSteppedTrackerContext,
  useTrackerStepContext,
} from "../SteppedTrackerContext";

import trackerStepCss from "./TrackerStep.css";

const withBaseName = makePrefixer("saltTrackerStep");

type TBC_PROP_NAMEOptions = "pending" | "completed" | "warning" | "error";

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * The slug of the icon to be displayed in the TrackerStep
   */
  TBC_PROP_NAME?: TBC_PROP_NAMEOptions;
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
          "The TrackerStep component must be placed within a SteppedTracker component"
        );
      }
    }
  }, [isWithinSteppedTracker]);
};

const parseIconSlug = (iconSlug: TBC_PROP_NAMEOptions, active: boolean) => {
  if (iconSlug === "completed") return iconSlug;
  if (active) return "active";
  return iconSlug;
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(props, ref) {
    const {
      TBC_PROP_NAME = "pending",
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
    const iconSlug = parseIconSlug(TBC_PROP_NAME, isActive);

    const Icon = iconMap[iconSlug];
    const connectorState = activeStep > stepNumber ? "active" : "default";
    const hasConnector = stepNumber < totalSteps - 1;

    const innerStyle = {
      ...style,
      "--saltTrackerStep-width": `${100 / totalSteps}%`,
    };

    return (
      <li
        className={clsx(withBaseName(), withBaseName(iconSlug), className)}
        style={innerStyle}
        aria-current={isActive ? "step" : undefined}
        data-state={iconSlug}
        ref={ref}
        {...restProps}
      >
        <Icon />
        {hasConnector && <TrackerConnector state={connectorState} />}
        <div className={withBaseName("body")}>{children}</div>
      </li>
    );
  }
);
