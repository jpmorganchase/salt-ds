import { ComponentType, forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer, IconProps } from "@brandname/core";
import { ArrowUpIcon, ArrowDownIcon } from "@brandname/icons";
import { useMetricContext, capitalise } from "./internal";

import "./MetricContent.css";

export interface MetricContentProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * These props will be passed to the indicator icon. Use this to render a
   * custom icon.
   *
   * @see `Icon` for a list of valid props.
   */
  IndicatorIconProps?: Partial<IconProps>;
  /**
   * Replace the default Icon component
   */
  IndicatorIconComponent?: ComponentType<IconProps>;
  /**
   * @ignore - this is passed from the parent <Metric/> component
   *
   * The ARIA props to be applied to the main value if the component is considered as a `heading`,
   * i.e. it is the first component inside the metric.
   */
  headingAriaProps?: {
    role: string;
    "aria-level": number;
    "aria-labelledby": string;
  };
  /**
   * Other data that may serve as additional information to the main value
   */
  subvalue?: string | number;
  /**
   * The main value to display in the metric
   */
  value: string | number;
}

const withBaseName = makePrefixer("uitkMetricContent");

export const MetricContent = forwardRef<HTMLDivElement, MetricContentProps>(
  function MetricContent(
    {
      IndicatorIconProps,
      IndicatorIconComponent,
      className,
      value,
      subvalue,
      headingAriaProps,
      ...restProps
    },
    ref
  ) {
    const {
      align,
      emphasis,
      direction,
      orientation,
      showIndicator,
      indicatorPosition,
      valueId,
    } = useMetricContext();

    const iconSize = emphasis === "low" ? 12 : 24;

    const iconProps = {
      "aria-label": direction,
      className: withBaseName("indicator"),
      "data-testid": "metric-indicator",
      name: `movement-${direction}`,
      size: iconSize,
      ...IndicatorIconProps,
    };

    const IconComponent =
      IndicatorIconComponent ??
      (direction === "down"
        ? ArrowDownIcon
        : direction === "up"
        ? ArrowUpIcon
        : undefined);

    const icon =
      showIndicator && IconComponent ? <IconComponent {...iconProps} /> : null;

    return (
      <div
        {...restProps}
        className={cx(
          withBaseName(),
          {
            [withBaseName(`${emphasis}Emphasis`)]: emphasis,
            [withBaseName(`direction${capitalise(direction)}`)]: direction,
            [withBaseName(orientation as string)]: orientation,
            [withBaseName(`align${capitalise(align)}`)]: align,
          },
          className
        )}
        ref={ref}
      >
        <div>
          {indicatorPosition === "start" && icon}
          <span
            className={withBaseName("value")}
            data-testid="metric-value"
            id={valueId}
            {...headingAriaProps}
          >
            {value}
          </span>
          {indicatorPosition === "end" && icon}
        </div>
        {subvalue && (
          <div
            className={withBaseName("subvalue")}
            data-testid="metric-subvalue"
          >
            {subvalue}
          </div>
        )}
      </div>
    );
  }
);
