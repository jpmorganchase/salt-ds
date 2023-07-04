import {
  ComponentPropsWithoutRef,
  forwardRef,
  RefCallback,
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

export interface TrackerStepProps extends ComponentPropsWithoutRef<"li"> {
  _isActive: boolean;
  _hasConnector: boolean;
  _overflowRef: RefCallback<HTMLElement>;
  _hasTooltip: boolean;
  _totalSteps: number;

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
  isActive,
  completed,
}: {
  isActive: boolean;
  completed: boolean;
}) => {
  if (completed) {
    return "completed";
  }
  if (isActive) {
    return "active";
  }
  return "default";
};

const getStateIcon = ({
  isActive,
  completed,
}: {
  isActive: boolean;
  completed: boolean;
}) => {
  if (completed) {
    return StepSuccessIcon;
  }
  if (isActive) {
    return StepActiveIcon;
  }
  return StepDefaultIcon;
};

export const TrackerStep = forwardRef<HTMLLIElement, TrackerStepProps>(
  function TrackerStep(props, ref?) {
    const {
      _isActive: isActive,
      _hasConnector: hasConnector,
      _overflowRef: overflowRef,
      _hasTooltip: hasTooltip,
      _totalSteps: totalSteps,
      completed = false,
      disabled,
      className,
      children,
      ...restProps
    } = props;

    const isWithinSteppedTracker = "getOverflowRef" in props;

    useEffect(() => {
      if (!isWithinSteppedTracker) {
        console.error(
          "The <TrackerStep> component should only be used within a <StepTracker> component"
        );
      }
    }, [isWithinSteppedTracker]);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tracker-step",
      css: trackerStepCss,
      window: targetWindow,
    });

    const Icon = getStateIcon({ isActive, completed });
    const state = getState({ isActive, completed });

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
        {hasConnector && <TrackerConnector state={state} />}
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
