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
import { InfoRendererProps } from "../LinearProgress/LinearProgress";

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
   * Disabled flag, true when the component is disabled.
   */
  disabled?: boolean;
  /**
   * The value of the max progress indicator.
   * Default value is 100.
   */
  max?: number;
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
   * Default unit is`%`
   */
  unit?: string;
  /**
   * The value of the progress indicator.
   * Value between 0 and max.
   */
  value?: number;
}

/**
 * Circular progress bar with an optional Info element, showing the current value
 * The default Info element can be rendered by setting `unit` and `value` props.
 * A custom Info element can be rendered using the `renderInfo` callback.
 * The render props callback is of the form
 * @param {string} unit the unit of the progress info
 * @param {number} value the value of the progress info
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
    max = 100,
    showInfo = true,
    renderInfo,
    value = 0,
    unit = "%",
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
  const rootStyle: CSSProperties = {};
  const rootProps: HTMLAttributes<any> = {};

  const progress = (value / max) * 100;

  rootProps["aria-valuenow"] = Math.round(value);

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
        value={Math.round(progress)}
        {...rest}
      />
    );
  }

  return (
    <div
      className={clsx(
        withBaseName(),
        { [withBaseName("disabled")]: disabled },
        className
      )}
      data-testid="circular-progress"
      ref={ref}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
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
