import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer, Text } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import linearProgressCss from "./LinearProgress.css";

const withBaseName = makePrefixer("saltLinearProgress");

export interface LinearProgressProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether to hide the text label within the progress. Defaults to `false`.
   */
  hideLabel?: boolean;
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

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
    { className, hideLabel = false, max = 100, min = 0, value = 0, ...rest },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-linear-progress",
      css: linearProgressCss,
      window: targetWindow,
    });

    const progress = ((value - min) / (max - min)) * 100;

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
        {!hideLabel && (
          <Text styleAs="h2" className={withBaseName("progressValue")}>
            {`${Math.round(progress)} %`}
          </Text>
        )}
      </div>
    );
  }
);
