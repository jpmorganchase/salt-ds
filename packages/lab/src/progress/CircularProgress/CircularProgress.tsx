import { ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer, Text } from "@salt-ds/core";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import circularProgressCSS from "./CircularProgress.css";

const withBaseName = makePrefixer("saltCircularProgress");

export interface CircularProgressProps extends ComponentPropsWithoutRef<"div"> {
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

/**
 * Circular progress bar with a label showing the current value
 */
export const CircularProgress = forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(function CircularProgress(
  { className, hideLabel = false, max = 100, min = 0, value = 0, ...rest },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  const subOverlayRightStyle: CSSProperties = {};
  const subOverlayLeftStyle: CSSProperties = {};

  const getRotationAngle = (progress: number, shift = 0) => {
    return -180 + ((progress - shift) / 50) * 180;
  };

  const progress = (value / max) * 100;

  if (progress <= 50) {
    const rotationAngle = getRotationAngle(progress);
    subOverlayRightStyle.transform = `rotate(${rotationAngle}deg)`;
    subOverlayLeftStyle.transform = "rotate(-180deg)";
  } else {
    const rotationAngle = getRotationAngle(progress, 50);
    subOverlayRightStyle.transform = "rotate(0deg)";
    subOverlayLeftStyle.transform = `rotate(${rotationAngle}deg)`;
  }

  return (
    <div
      className={clsx(withBaseName(), className)}
      data-testid="circular-progress"
      ref={ref}
      role="progressbar"
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={Math.round(value)}
      {...rest}
    >
      <div className={withBaseName("track")} />
      <div className={withBaseName("bars")}>
        <div className={withBaseName("barOverlayRight")}>
          <div
            className={withBaseName("barSubOverlayRight")}
            data-testid="barSubOverlayRight"
            style={subOverlayRightStyle}
          >
            <div className={withBaseName("bar")} />
          </div>
        </div>
        <div className={withBaseName("barOverlayLeft")}>
          <div
            className={withBaseName("barSubOverlayLeft")}
            data-testid="barSubOverlayLeft"
            style={subOverlayLeftStyle}
          >
            <div className={withBaseName("bar")} />
          </div>
        </div>
      </div>
      {!hideLabel && (
        <Text styleAs="h2" className={withBaseName("progressValue")}>
          {`${Math.round(progress)} %`}
        </Text>
      )}
    </div>
  );
});
