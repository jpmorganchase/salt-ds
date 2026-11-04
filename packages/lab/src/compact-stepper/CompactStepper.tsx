import { makePrefixer, Text, useIcon } from "@salt-ds/core";
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
import {
  type CompactStepperStep,
  getCompactStepperState,
} from "./internal/getCompactStepperState";

export interface CompactStepperProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Steps of the process.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltCompactStepper");

function useCompactStepperIcon(step?: CompactStepperStep) {
  const { ErrorIcon, WarningIcon, LockedIcon } = useIcon();

  if (!step) {
    return undefined;
  }

  const stateToIcon: Partial<Record<string, ElementType>> = {
    error: ErrorIcon,
    warning: WarningIcon,
    locked: LockedIcon,
  };

  return stateToIcon[step.status || step.stage];
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
      activeCount,
      hasNonStepChild,
    } = getCompactStepperState(children);
    const totalSteps = steps.length;

    const Icon = useCompactStepperIcon(current);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (totalSteps === 0) {
          console.warn(
            "<CompactStepper /> should contain at least one <Step />.",
          );
        }
        if (activeCount > 1) {
          console.warn(
            '<CompactStepper /> should contain only one <Step stage="active" />. Using the first one.',
          );
        }
        if (hasNonStepChild) {
          console.warn(
            "<CompactStepper /> children should be <Step /> elements.",
          );
        }
      }
    }, [totalSteps, activeCount, hasNonStepChild]);

    return (
      <div
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
          <div className={withBaseName("track")} />
          {current && (
            <div
              className={withBaseName("bar")}
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
        {current && (
          <Text className={withBaseName("text")}>
            {`Step ${currentIndex + 1} of ${totalSteps}:`}
            {Icon ? (
              <Icon className={withBaseName("icon")} size={1} aria-hidden />
            ) : (
              " "
            )}
            <Text
              as="span"
              styleAs="inherit"
              fontWeight="bolder"
              className={withBaseName("label")}
            >
              {current.label}
            </Text>
            {Icon && (
              <>
                {" "}
                <span className="salt-visuallyHidden">
                  {current.status || current.stage}
                </span>
              </>
            )}
          </Text>
        )}
      </div>
    );
  },
);
