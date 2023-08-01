import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { Info } from "../Info";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import circularProgressCSS from "./CircularProgress.css";

const withBaseName = makePrefixer("saltCircularProgress");

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * A label for accessibility
   */
  "aria-label"?: string;
  /**
   * The className(s) of the component
   */
  className?: string;
  /**
   * The value of the max progress indicator.
   * Default value is 100.
   */
  max?: number;
  /**
   * If `true`, the info panel will be displayed.
   */
  showInfo?: boolean;
  /**
   * The value of the progress indicator.
   * Value between 0 and max.
   */
  value?: number;
}

/**
 * Circular progress bar with an optional Info element, showing the current value
 */
export const CircularProgress = forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(function CircularProgress(
  {
    "aria-label": ariaLabel,
    className,
    max = 100,
    showInfo = true,
    value = 0,
    ...rest
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  const circleStyle: CSSProperties = {};
  const railCircleStyle: CSSProperties = {};
  const progress = (value / max) * 100;

  const progressStrokeLength = `calc(${progress} * var(--circularProgress-progressCircle-circumference) / 100)`;
  const progressGapLength = `calc((100 - ${progress}) * var(--circularProgress-progressCircle-circumference) / 100)`;
  const railStrokeLength = `calc((100 - ${progress}) * var(--circularProgress-railCircle-circumference) / 100)`;
  const railGapLength = `calc((${progress}) * var(--circularProgress-railCircle-circumference) / 100)`;

  circleStyle.strokeDasharray = `${progressStrokeLength} ${progressGapLength}`;
  railCircleStyle.strokeDashoffset = `${railStrokeLength}`;
  railCircleStyle.strokeDasharray = `${railStrokeLength} ${railGapLength}`;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.error(
        "Salt: aria-label value not supplied to CircularProgress. This may affect the ADA compliance level of the component and owning application, and may generate errors in automated accessibility testing software"
      );
    }
  }, [ariaLabel]);

  let progressInfo: ReactNode = null;
  if (showInfo) {
    progressInfo = (
      <Info
        className={withBaseName("progressValue")}
        unit="%"
        value={Math.round(progress)}
      />
    );
  }

  return (
    <div
      className={clsx(withBaseName(), className)}
      data-testid="circular-progress"
      ref={ref}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={Math.round(value)}
      {...rest}
    >
      <svg className={withBaseName("svg")}>
        <circle
          cx="50%"
          cy="50%"
          fill="none"
          style={railCircleStyle}
          className={withBaseName("railCircle")}
        />

        <circle
          cx="50%"
          cy="50%"
          fill="none"
          style={circleStyle}
          className={withBaseName("circle")}
        />
      </svg>
      {progressInfo}
    </div>
  );
});
