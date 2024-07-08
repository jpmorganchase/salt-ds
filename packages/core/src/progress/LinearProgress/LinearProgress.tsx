import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { Text } from "../../text";
import { makePrefixer } from "../../utils";

import linearProgressCss from "./LinearProgress.css";

const withBaseName = makePrefixer("saltLinearProgress");

export interface LinearProgressProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The value of the buffer indicator.
   * Value between `min` and `max`.
   * When no `value` and `bufferValue` is passed in, show as indeterminate state.
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
   * Value between `min` and `max`.
   * When no `value` and `bufferValue` is passed in, show as indeterminate state.
   */
  value?: number;
}

export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
    {
      className,
      hideLabel = false,
      max = 100,
      min = 0,
      value,
      bufferValue,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-linear-progress",
      css: linearProgressCss,
      window: targetWindow,
    });

    const isIndeterminate = value === undefined && bufferValue === undefined;
    const progress =
      value === undefined ? 0 : ((value - min) / (max - min)) * 100;
    const buffer =
      bufferValue === undefined ? 0 : ((bufferValue - min) / (max - min)) * 100;
    const barStyle = {
      width: isIndeterminate ? undefined : `${progress}%`,
    };
    const bufferStyle = {
      width: `${buffer}%`,
    };

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        role="progressbar"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value === undefined ? undefined : Math.round(value)}
        {...rest}
      >
        <div className={withBaseName("barContainer")}>
          <div
            className={clsx(withBaseName("bar"), {
              [withBaseName("indeterminate")]: isIndeterminate,
            })}
            style={barStyle}
          />
          {bufferValue && bufferValue > 0 ? (
            <div className={withBaseName("buffer")} style={bufferStyle} />
          ) : null}
          <div className={withBaseName("track")} />
        </div>
        {!hideLabel && (
          <Text styleAs="h2" className={withBaseName("progressLabel")}>
            {isIndeterminate ? "— %" : `${Math.round(progress)} %`}
          </Text>
        )}
      </div>
    );
  },
);
