import { CSSProperties, forwardRef, HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { Info } from "../Info";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import linearProgressCss from "./LinearProgress.css";

const withBaseName = makePrefixer("saltLinearProgress");

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The className(s) of the component.
   */
  className?: string;
  /**
   * The value of the max progress indicator.
   * Default value is 100.
   */
  max?: number;
  /**
   * Default unit is `%`.
   */
  unit?: string;
  /**
   * The value of the progress indicator.
   * Value between 0 and max.
   */
  value?: number;
}

/**
 * Linear progress bar with an Info element showing the current value
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress({ className, max = 100, value = 0, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-linear-progress",
      css: linearProgressCss,
      window: targetWindow,
    });

    const progress = (value / max) * 100;

    const progressInfo = (
      <Info
        unit="%"
        value={Math.round(progress)}
        className={withBaseName("progressValue")}
      />
    );

    const barStyle: CSSProperties = {};
    const trackStyle: CSSProperties = {};

    barStyle.transform = `translateX(${progress - 100}%)`;
    trackStyle.transform = `translateX(${progress}%)`;

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        data-testid="linear-progress"
        role="progressbar"
        aria-valuemax={max}
        aria-valuemin={0}
        aria-valuenow={Math.round(value)}
        {...rest}
      >
        <div className={withBaseName("barContainer")}>
          <div className={withBaseName("bar")} style={barStyle} />
          <div className={withBaseName("track")} style={trackStyle} />
        </div>
        {progressInfo}
      </div>
    );
  }
);
