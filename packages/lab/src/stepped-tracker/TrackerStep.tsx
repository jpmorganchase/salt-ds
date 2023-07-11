import {
  ComponentPropsWithoutRef,
  CSSProperties,
  forwardRef,
  RefCallback,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { makePrefixer, Tooltip } from "@salt-ds/core";
import {
  StepActiveIcon,
  StepDefaultIcon,
  StepSuccessIcon,
} from "@salt-ds/icons";
import { TrackerConnector } from "./TrackerConnector";

import trackerStepCss from "./TrackerStep.css";

const withBaseName = makePrefixer("saltTrackerStep");

type State = "default" | "completed";

type StateWithActive = State | "active";

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * The state of the TrackerStep
   */
  state?: State;
}

// Internal props passed by the parent SteppedTracker
type TrackerStepInjectedProps = {
  /**
   * The index of the active currently active step
   */
  _activeStep: number;
  /**
   * A callback ref for the label container, used to observe the element for truncation
   */
  _overflowRef: RefCallback<HTMLElement>;
  /**
   * Whether the step should show a tooltip (in the case of any label being truncated)
   */
  _hasTooltip: boolean;
  /**
   * The total steps in the SteppedTracker
   */
  _totalSteps: number;
  /**
   * The index position of this TrackerStep
   */
  _stepNumber: number;
};

type WithInjectedProps = TrackerStepProps & TrackerStepInjectedProps;

const iconMap = {
  default: StepDefaultIcon,
  completed: StepSuccessIcon,
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

const injectedProps: (keyof TrackerStepInjectedProps)[] = [
  "_activeStep",
  "_overflowRef",
  "_hasTooltip",
  "_totalSteps",
  "_stepNumber",
];

const useCheckWithinValidParent = (props: WithInjectedProps) => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      for (const key of injectedProps) {
        if (!(key in props)) {
          console.error(
            "The <TrackerStep> component should only be used within a <StepTracker> component"
          );
          break;
        }
      }
    }
  }, [props]);
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(props, ref?) {
    const {
      _activeStep: activeStep,
      _overflowRef: overflowRef,
      _hasTooltip: hasTooltip,
      _totalSteps: totalSteps,
      _stepNumber: stepNumber,
      state = "default",
      className,
      children,
      ...restProps
    } = props as WithInjectedProps;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tracker-step",
      css: trackerStepCss,
      window: targetWindow,
    });

    useCheckWithinValidParent(props as WithInjectedProps);

    const isActive = activeStep === stepNumber;
    const Icon = getStateIcon({ isActive, state });
    const resolvedState = getState({ isActive, state });
    const connectorState = activeStep > stepNumber ? "active" : "default";
    const hasConnector = stepNumber < totalSteps - 1;

    const Inner = (
      <li
        {...restProps}
        className={clsx(withBaseName(), withBaseName(resolvedState), className)}
        style={
          {
            ...props.style,
            "--tracker-step-width": `${100 / totalSteps}%`,
          } as CSSProperties
        }
        tabIndex={hasTooltip ? 0 : undefined}
        aria-current={isActive ? "step" : undefined}
        data-state={state}
        ref={ref}
      >
        <Icon />
        {hasConnector && <TrackerConnector state={connectorState} />}
        <div ref={overflowRef} className={clsx(withBaseName("body"))}>
          {children}
        </div>
      </li>
    );

    if (!hasTooltip) {
      return Inner;
    }

    return (
      <Tooltip placement="top" content={children}>
        {Inner}
      </Tooltip>
    );
  }
);
