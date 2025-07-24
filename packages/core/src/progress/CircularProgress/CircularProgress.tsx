import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
} from "react";
import { Text } from "../../text";
import { makePrefixer } from "../../utils";

import circularProgressCSS from "./CircularProgress.css";

const withBaseName = makePrefixer("saltCircularProgress");

const getRotationAngle = (bar: number, shift = 0) => {
  return -180 + ((bar - shift) / 50) * 180;
};

export interface CircularProgressProps extends ComponentPropsWithoutRef<"div"> {
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
}

export const CircularProgress = forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(function CircularProgress(
  {
    className,
    hideLabel = false,
    max = 100,
    min = 0,
    value = 0,
    bufferValue = 0,
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-circular-progress",
    css: circularProgressCSS,
    window: targetWindow,
  });

  const bufferSubOverlayRightStyle: CSSProperties = {};
  const bufferSubOverlayLeftStyle: CSSProperties = {};
  const barSubOverlayRightStyle: CSSProperties = {};
  const barSubOverlayLeftStyle: CSSProperties = {};

  const buffer = ((bufferValue - min) / (max - min)) * 100;
  const progress = ((value - min) / (max - min)) * 100;

  if (progress <= 50) {
    const rotationAngle = getRotationAngle(progress);
    barSubOverlayRightStyle.transform = `rotate(${rotationAngle}deg)`;
    barSubOverlayLeftStyle.transform = "rotate(-180deg)";
  } else {
    const rotationAngle = getRotationAngle(progress, 50);
    barSubOverlayRightStyle.transform = "rotate(0deg)";
    barSubOverlayLeftStyle.transform = `rotate(${rotationAngle}deg)`;
  }
  if (buffer <= 50) {
    const rotationAngle = getRotationAngle(buffer);
    bufferSubOverlayRightStyle.transform = `rotate(${rotationAngle}deg)`;
    bufferSubOverlayLeftStyle.transform = "rotate(-180deg)";
  } else {
    const rotationAngle = getRotationAngle(buffer, 50);
    bufferSubOverlayRightStyle.transform = "rotate(0deg)";
    bufferSubOverlayLeftStyle.transform = `rotate(${rotationAngle}deg)`;
  }

  return (
    <div
      className={clsx(withBaseName(), className)}
      ref={ref}
      role="progressbar"
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={Math.round(value)}
      {...rest}
    >
      <div className={withBaseName("track")} />
      <div className={withBaseName("bars")}>
        {buffer > 0 && (
          <div className={withBaseName("bufferOverlayRight")}>
            <div
              className={clsx(withBaseName("bufferSubOverlayRight"), {
                [withBaseName("bufferSubOverlay")]: buffer <= 50,
              })}
              style={bufferSubOverlayRightStyle}
            >
              <div className={withBaseName("bufferBackground")} />
              <div className={withBaseName("bufferBorder")} />
            </div>
          </div>
        )}
        <div className={withBaseName("barOverlayRight")}>
          <div
            className={withBaseName("barSubOverlayRight")}
            style={barSubOverlayRightStyle}
          >
            <div className={withBaseName("bar")} />
          </div>
        </div>
        {buffer > 0 && (
          <div className={withBaseName("bufferOverlayLeft")}>
            <div
              className={clsx(
                withBaseName("bufferSubOverlay"),
                withBaseName("bufferSubOverlayLeft"),
              )}
              style={bufferSubOverlayLeftStyle}
            >
              <div className={withBaseName("bufferBorder")} />
              <div className={withBaseName("bufferBackground")} />
            </div>
          </div>
        )}
        <div className={withBaseName("barOverlayLeft")}>
          <div
            className={withBaseName("barSubOverlayLeft")}
            style={barSubOverlayLeftStyle}
          >
            <div className={withBaseName("bar")} />
          </div>
        </div>
      </div>
      {!hideLabel && (
        <Text styleAs="h2" className={withBaseName("progressLabel")}>
          {`${Math.round(progress)} %`}
        </Text>
      )}
    </div>
  );
});
