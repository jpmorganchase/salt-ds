import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";
import { Info as DefaultInfo } from "../Info";
import { Circle, LinearGradient, SIZE, ViewBox } from "./CircularProgressParts";
import { InfoRendererProps } from "../LinearProgress/LinearProgress";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import circularProgressCSS from "./CircularProgress.css";

const MAX = 100;
const MIN = 0;

const withBaseName = makePrefixer("saltCircularProgress");

export const SIZE_OPTIONS = {
  small: {
    container: 36,
  },
  medium: {
    container: 48,
  },
  large: {
    container: 60,
  },
};

function getRelativeValue(value: number, min: number, max: number): number {
  return (Math.min(Math.max(min, value), max) - min) / (max - min);
}

function easeOut(t: number): number {
  t = getRelativeValue(t, 0, 1);
  t = (t -= 1) * t * t + 1;
  return t;
}

function easeIn(t: number): number {
  return t * t;
}

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
   * Disabled flag, true when the component is disabled.
   */
  disabled?: boolean;
  /**
   * Render props callback to render info panel.
   * @param function({ value, unit, getValueProps })
   */
  renderInfo?: (
    props: Pick<InfoRendererProps<any, any>, "value" | "unit" | "getValueProps">
  ) => ReactElement<InfoRendererProps<any, any>>;
  /**
   * If `true`, the info panel will be displayed.
   */
  showInfo?: boolean;
  /**
   * The size of the circle
   * (small, medium, large)
   */
  size?: "small" | "medium" | "large";
  /**
   * Default unit is`%`
   */
  unit?: string;
  /**
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value?: number;
  /**
   * The variant to use.
   * Use indeterminate or query when there is no progress value.
   */
  variant?: "determinate" | "indeterminate" | "static";
}

/**
 * Circular progress bar with an optional Info element, showing the current value
 * The default Info element can be rendered by setting `unit` and `value` props.
 * A custom Info element can be rendered using the `renderInfo` callback.
 * The render props callback is of the form
 * @param {string} unit the unit of the progress info
 * @param {number} value the value of the progress info
 * @param {string} variant the variant to use.
 * @param {function} getValueProps function callback that returns the value props
 */
export const CircularProgress = forwardRef<
  HTMLDivElement,
  CircularProgressProps
>(function CircularProgress(
  {
    "aria-label": ariaLabel,
    className,
    disabled,
    showInfo = true,
    size = "small",
    renderInfo,
    value = 0,
    unit = "%",
    variant = "static",
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
  const rootStyle: CSSProperties = {};
  const rootProps: HTMLAttributes<any> = {};

  if (variant === "determinate" || variant === "static") {
    const circumference = 2 * Math.PI * ((SIZE - 2) * 0.5);
    circleStyle.strokeDasharray = circumference.toFixed(3);
    rootProps["aria-valuenow"] = Math.round(value);

    if (variant === "static") {
      circleStyle.strokeDashoffset = `${(
        ((100 - value) / 100) *
        circumference
      ).toFixed(3)}px`;
      rootStyle.transform = "rotate(-90deg)";
    } else {
      circleStyle.strokeDashoffset = `${(
        easeIn((100 - value) / 100) * circumference
      ).toFixed(3)}px`;
      rootStyle.transform = `rotate(${(easeOut(value / 70) * 270).toFixed(
        3
      )}deg)`;
    }
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !ariaLabel) {
      // eslint-disable-next-line no-console
      console.error(
        "Salt: aria-label value not supplied to CircularProgress. This may affect the ADA compliance level of the component and owning application, and may generate errors in automated accessibility testing software"
      );
    }
  }, [ariaLabel]);

  const containerSize = SIZE_OPTIONS[size].container;

  const getValueProps = () => ({
    unit,
    value,
    getValueProps: (valueProps = {}) => ({
      className: withBaseName("progressValue"),
      ...valueProps,
    }),
  });

  let progressInfo: ReactNode = null;
  if (showInfo) {
    progressInfo = renderInfo ? (
      renderInfo(getValueProps())
    ) : (
      <DefaultInfo
        className={withBaseName("progressValue")}
        unit={unit}
        value={value}
        {...rest}
      />
    );
  }

  return (
    <div
      className={clsx(className, "saltCircularProgress", {
        [withBaseName("small")]: size === "small",
        [withBaseName("medium")]: size === "medium",
        [withBaseName("large")]: size === "large",
        [withBaseName("disabled")]: disabled,
      })}
      data-testid="circular-progress"
      ref={ref}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemax={MAX}
      aria-valuemin={MIN}
      aria-valuenow={value}
      {...rest}
    >
      <div
        className={clsx(withBaseName("container"), {
          [withBaseName("indeterminate")]: variant === "indeterminate",
          [withBaseName("static")]: variant === "static",
        })}
        style={{ width: containerSize, height: containerSize, ...rootStyle }}
      >
        <ViewBox>
          <LinearGradient />
          <Circle className={withBaseName("railCircle")} strokeWidth={1} />
          <Circle
            strokeWidth={2}
            style={circleStyle}
            className={clsx(withBaseName("circle"), {
              [withBaseName("circleIndeterminate")]:
                variant === "indeterminate",
              [withBaseName("circleStatic")]: variant === "static",
            })}
          />
        </ViewBox>
      </div>
      {progressInfo}
    </div>
  );
});
