import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "../../utils";
import { Text } from "../../text";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import linearProgressCss from "./LinearProgress.css";

const withBaseName = makePrefixer("saltLinearProgress");

export interface LinearProgressProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The value of the buffer indicator.
   * Value between 0 and max.
   */
  bufferValue?: number;
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
  /**
   * The variant to use.
   * Defaults to "determinate".
   */
  variant?: "determinate" | "indeterminate";
}

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
    {
      className,
      hideLabel = false,
      max = 100,
      min = 0,
      value = 0,
      bufferValue = 0,
      variant = "determinate",
      ...rest
    },
    ref
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-linear-progress",
      css: linearProgressCss,
      window: targetWindow,
    });

    const isIndeterminate = variant === "indeterminate";
    const progress = isIndeterminate ? 66 : ((value - min) / (max - min)) * 100;
    const buffer = isIndeterminate
      ? 0
      : ((bufferValue - min) / (max - min)) * 100;
    const barStyle: CSSProperties = {};
    const bufferStyle: CSSProperties = {};

    barStyle.width = `${progress}%`;
    bufferStyle.width = `${buffer}%`;

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        role="progressbar"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={isIndeterminate ? undefined : Math.round(value)}
        {...rest}
      >
        <div className={withBaseName("barContainer")}>
          <div
            className={clsx(withBaseName("bar"), withBaseName(variant))}
            style={barStyle}
          />
          {bufferValue > 0 ? (
            <div className={withBaseName("buffer")} style={bufferStyle} />
          ) : null}
          <div className={withBaseName("track")} />
        </div>
        {!hideLabel && (
          <Text styleAs="h2" className={withBaseName("progressLabel")}>
            {isIndeterminate ? `— %` : `${Math.round(progress)} %`}
          </Text>
        )}
      </div>
    );
  }
);
