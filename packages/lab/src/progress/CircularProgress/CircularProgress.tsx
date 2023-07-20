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
import { Circle } from "./Circle";
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
   * The value of the max progress indicator for the determinate variant.
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
   * The value of the progress indicator for the determinate and static variants.
   * Value between 0 and 100.
   */
  value?: number;
  /**
   * The variant to use.
   * Use indeterminate or query when there is no progress value.
   */
  variant?: "determinate" | "indeterminate";
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
    max = 100,
    showInfo = true,
    renderInfo,
    value = 0,
    unit = "%",
    variant = "determinate",
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

  const progress = (value / max) * 100;

  if (variant === "determinate") {
    rootProps["aria-valuenow"] = Math.round(value);
    circleStyle.strokeDasharray = "var(--progress-circle-circumference)";
    circleStyle.strokeDashoffset = `calc((100 - ${progress}) / 100 * var(--progress-circle-circumference))`;
    rootStyle.transform = "rotate(-90deg)";
  }

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
      className={clsx(className, "saltCircularProgress", {
        [withBaseName("disabled")]: disabled,
      })}
      data-testid="circular-progress"
      ref={ref}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      {...rest}
    >
      <div
        className={clsx(withBaseName("container"), {
          [withBaseName("indeterminate")]: variant === "indeterminate",
          [withBaseName("determinate")]: variant === "determinate",
        })}
        style={{ ...rootStyle }}
      >
        <svg className="saltCircularProgress-svg">
          <Circle className={withBaseName("railCircle")} />
          <Circle
            style={circleStyle}
            className={clsx(withBaseName("circle"), {
              [withBaseName("circleIndeterminate")]:
                variant === "indeterminate",
              [withBaseName("circleDeterminate")]: variant === "determinate",
            })}
          />
        </svg>
      </div>
      {variant === "determinate" && progressInfo}
    </div>
  );
});
