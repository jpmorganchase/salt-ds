import {
  makePrefixer,
  type StepStage,
  type StepStatus,
  Text,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";

import compactStepperCss from "./CompactStepper.css";
import { getCompactStepperState } from "./internal/getCompactStepperState";

export interface CompactStepperProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Steps of the process.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltCompactStepper");

type StepState = StepStatus | StepStage;

function useCompactStepperIcon(state?: StepState) {
  const { ErrorIcon, WarningIcon, LockedIcon } = useIcon();

  const stateToIcon: Partial<Record<StepState, ElementType>> = {
    error: ErrorIcon,
    warning: WarningIcon,
    locked: LockedIcon,
  };

  return state && stateToIcon[state];
}

export const CompactStepper = forwardRef<HTMLDivElement, CompactStepperProps>(
  function CompactStepper({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-compact-stepper",
      css: compactStepperCss,
      window: targetWindow,
    });

    const {
      steps,
      currentIndex,
      current,
      progress,
      currentCount,
      hasNonStepChild,
    } = getCompactStepperState(children);
    const totalSteps = steps.length;

    // Status takes precedence over stage, as in Stepper.
    const state = current?.status ?? current?.stage;
    const Icon = useCompactStepperIcon(state);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (totalSteps === 0) {
          console.warn(
            "<CompactStepper /> should contain at least one <Step />.",
          );
        }
        if (currentCount > 1) {
          console.warn(
            '<CompactStepper /> should contain only one <Step stage="active" /> or <Step stage="locked" />. Using the first one.',
          );
        }
        if (hasNonStepChild) {
          console.warn(
            "<CompactStepper /> children should be <Step /> elements.",
          );
        }
      }
    }, [totalSteps, currentCount, hasNonStepChild]);

    return (
      <div
        role="group"
        className={clsx(
          withBaseName(),
          current && withBaseName(`stage-${current.stage}`),
          current?.status && withBaseName(`status-${current.status}`),
          className,
        )}
        ref={ref}
        {...rest}
      >
        <div className={withBaseName("barContainer")} aria-hidden="true">
          {current && (
            <div
              className={withBaseName("bar")}
              style={{ width: `${progress}%` }}
            />
          )}
          <div className={withBaseName("track")} />
        </div>
        {current && (
          <Text className={withBaseName("text")}>
            <span className={withBaseName("count")}>
              {`Step ${currentIndex + 1} of ${totalSteps}:`}
            </span>
            {/* The count's margin sets the visible gap; this space keeps the word break for wrapping, copying and assistive technology. */}
            <span className={withBaseName("separator")}> </span>
            {Icon && (
              <Icon className={withBaseName("icon")} size={1} aria-hidden />
            )}
            <Text
              as="span"
              styleAs="inherit"
              fontWeight="bolder"
              className={withBaseName("label")}
            >
              {current.label}
            </Text>
            {state && (
              <span
                className={clsx(
                  withBaseName("screenReaderOnly"),
                  withBaseName("state"),
                )}
              >{`, ${state}`}</span>
            )}
          </Text>
        )}
      </div>
    );
  },
);
