import {
  ComponentPropsWithoutRef,
  forwardRef,
  createContext,
  useContext,
  useEffect,
  useMemo,
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

type TrackerStepContextType = {
  activeStep: number;
  stepNumber: number;
  totalSteps: number;
  getOverflowRef: (i: number) => (el: HTMLElement | null) => void;
  hasTooltip: boolean;
};

const TrackerStepContext = createContext<TrackerStepContextType>(
  {} as TrackerStepContextType
);

export const TrackerStepProvider = TrackerStepContext.Provider;

const useTrackerStepContext = () => useContext(TrackerStepContext);

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  /**
   * If `true`, the stepped tracker will be disabled.
   */
  disabled?: boolean;
  /**
   * Whether the step should be marked as completed
   */
  completed?: boolean;
}

const getState = ({
  active,
  completed,
}: {
  active: boolean;
  completed: boolean;
}) => {
  if (completed) {
    return "completed";
  }
  if (active) {
    return "active";
  }
  return "default";
};

const getStateIcon = ({
  active,
  completed,
}: {
  active: boolean;
  completed: boolean;
}) => {
  if (completed) {
    return StepSuccessIcon;
  }
  if (active) {
    return StepActiveIcon;
  }
  return StepDefaultIcon;
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(
    { children, className, disabled, completed = false, ...restProps },
    ref?
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tracker-step",
      css: trackerStepCss,
      window: targetWindow,
    });

    const trackerStepContext = useTrackerStepContext();

    useEffect(() => {
      if (!trackerStepContext) {
        console.warn(
          "The <TrackerStep> component should only be used within a <StepTracker> component"
        );
      }
    }, [trackerStepContext]);

    const { activeStep, stepNumber, totalSteps, getOverflowRef, hasTooltip } =
      trackerStepContext;

    const overflowRef = useMemo(
      () => getOverflowRef(stepNumber),
      [stepNumber, getOverflowRef]
    );

    const active = activeStep === stepNumber;
    const isLast = stepNumber === totalSteps - 1;

    const Icon = getStateIcon({ active, completed });
    const state = getState({ active, completed });

    const Inner = (
      <li
        {...restProps}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("completed")]: completed,
          },
          className
        )}
        style={{
          width: `${100 / totalSteps}%`,
        }}
        tabIndex={hasTooltip ? 0 : undefined}
        {...restProps}
        ref={ref}
      >
        <Icon />
        {!isLast && <TrackerConnector state={state} />}
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
