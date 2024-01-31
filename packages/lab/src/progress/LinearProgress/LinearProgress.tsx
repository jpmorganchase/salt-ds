import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import linearProgressCss from "./LinearProgress.css";
import { Info } from "../internal/Info";

const withBaseName = makePrefixer("saltLinearProgress");

export interface LinearProgressProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether to hide the text info within the progress. Defaults to `false`.
   */
  hideInfo?: boolean;
  /**
   * The value of the max progress indicator.
   * Default value is 100.
   */
  max?: number;
  /**
   * The value of the min progress indicator.
   * Default value is 0.
   */
  min?: number;
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
  function LinearProgress(
    { className, hideInfo = false, max = 100, min = 0, value = 0, ...rest },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-linear-progress",
      css: linearProgressCss,
      window: targetWindow,
    });

    const progress = (value / max) * 100;

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
        aria-valuemin={min}
        aria-valuenow={Math.round(value)}
        {...rest}
      >
        <div className={withBaseName("barContainer")}>
          <div className={withBaseName("bar")} style={barStyle} />
          <div className={withBaseName("track")} style={trackStyle} />
        </div>
        {!hideInfo && (
          <Info
            className={withBaseName("progressValue")}
            unit="%"
            value={Math.round(progress)}
          />
        )}
      </div>
    );
  }
);
