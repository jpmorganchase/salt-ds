import { makePrefixer, Text } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useEffect,
} from "react";

import compactStepperCss from "./CompactStepper.css";
import { CompactStepperContext } from "./internal/CompactStepperContext";
import { getCompactStepperState } from "./internal/getCompactStepperState";

export interface CompactStepperProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The steps of the process, as `CompactStep` elements, which can be inside fragments. Components that wrap `CompactStep` are ignored.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltCompactStepper");

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

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (totalSteps === 0) {
          console.warn(
            "<CompactStepper /> should contain at least one <CompactStep />.",
          );
        }
        if (currentCount > 1) {
          console.warn(
            '<CompactStepper /> should contain only one <CompactStep stage="active" /> or <CompactStep stage="locked" />. Using the first one.',
          );
        }
        if (hasNonStepChild) {
          console.warn(
            "<CompactStepper /> children should be <CompactStep /> elements.",
          );
        }
      }
    }, [totalSteps, currentCount, hasNonStepChild]);

    return (
      <CompactStepperContext.Provider value={true}>
        <div
          role="group"
          className={clsx(withBaseName(), className)}
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
              {/* Invisible space for wrapping, copying and screen readers; the count's margin sets the visible gap. */}
              <span className={withBaseName("separator")}> </span>
              {current.element}
            </Text>
          )}
        </div>
      </CompactStepperContext.Provider>
    );
  },
);
