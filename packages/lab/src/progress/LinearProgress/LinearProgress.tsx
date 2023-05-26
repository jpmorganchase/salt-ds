import {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { Info as DefaultInfo } from "../Info";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import linearProgressCss from "./LinearProgress.css";

const withBaseName = makePrefixer("saltLinearProgress");

export interface InfoRendererProps<T, U> {
  unit: string;
  value: number;
  getUnitProps?: (props: T) => { className: string } & T;
  getValueProps: (props: U) => { className: string } & U;
}

type UnitAndValuePropsGetter<T, U> = (
  a: {
    unit: string;
    value: number;
  },
  b: {
    progressUnit: string;
    progressValue: string;
  }
) => InfoRendererProps<T, U>;

const getUnitAndValueProps: UnitAndValuePropsGetter<any, any> = (
  { unit, value },
  { progressUnit, progressValue }
) => ({
  unit,
  value,
  getUnitProps: (props = {}) => ({
    className: progressUnit,
    ...props,
  }),
  getValueProps: (props = {}) => ({
    className: progressValue,
    ...props,
  }),
});

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The className(s) of the component.
   */
  className?: string;
  /**
   * Disabled flag, true when the component is disabled.
   */
  disabled?: boolean;
  /**
   * render props callback to render info panel.
   */
  renderInfo?: (
    props: Pick<
      InfoRendererProps<any, any>,
      "value" | "unit" | "getValueProps" | "getUnitProps"
    >
  ) => ReactElement<InfoRendererProps<any, any>>;
  /**
   * If `true`, the info panel will be displayed.
   */
  showInfo?: boolean;
  /**
   * The size of the line, default is 'small'.
   */
  size?: "small" | "medium" | "large";
  /**
   * Default unit is`%`.
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
  variant?: "determinate" | "indeterminate" | "query";
}

/**
 * Linear progress bar with an optional Info element, showing the current value
 * The default Info element can be rendered by setting `unit` and `value` props.
 * A custom Info element can be rendered using the `renderInfo` callback.
 * The render props callback is of the form
 * @param {string} unit the unit of the progress info
 * @param {number} value the value of the progress info
 * @param {function} getUnitProps function callback that returns the unit props
 * @param {function} getValueProps function callback that returns the value props
 */
export const LinearProgress = forwardRef<HTMLDivElement, LinearProgressProps>(
  function LinearProgress(
    {
      className,
      disabled,
      renderInfo,
      showInfo = true,
      size = "small",
      variant = "determinate",
      unit = "%",
      value = 0,
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

    let progressInfo: ReactNode = null;

    const progressUnit = withBaseName("progressUnit");
    const progressValue = withBaseName("progressValue");

    if (showInfo) {
      progressInfo = renderInfo ? (
        renderInfo(
          getUnitAndValueProps(
            {
              unit,
              value,
            },
            {
              progressUnit,
              progressValue,
            }
          )
        )
      ) : (
        <DefaultInfo unit={unit} value={value} className={progressValue} />
      );
    }

    const rootProps: HTMLAttributes<HTMLDivElement> = {};
    const barStyle: CSSProperties = {};

    if (variant === "determinate") {
      rootProps["aria-valuenow"] = Math.round(value);
      rootProps["aria-valuemin"] = 0;
      rootProps["aria-valuemax"] = 100;
      barStyle.transform = `translateX(${value - 100}%)`;
    }

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("disabled")]: disabled,
            [withBaseName("small")]: size === "small",
            [withBaseName("medium")]: size === "medium",
            [withBaseName("large")]: size === "large",
          },
          className
        )}
        ref={ref}
        data-testid="linear-progress"
        role="progressbar"
        {...rootProps}
        {...rest}
      >
        <div
          className={clsx(withBaseName("barContainer"), {
            [withBaseName("determinate")]: variant === "determinate",
            [withBaseName("indeterminate")]: variant === "indeterminate",
            [withBaseName("query")]: variant === "query",
          })}
        >
          <div
            className={clsx(withBaseName("bar"), withBaseName("bar1"))}
            style={barStyle}
          />
          {variant === "determinate" ? null : (
            <div className={clsx(withBaseName("bar"), withBaseName("bar2"))} />
          )}
        </div>
        {progressInfo}
      </div>
    );
  }
);
