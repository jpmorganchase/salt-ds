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
      {progressInfo}
    </div>
  );
});
