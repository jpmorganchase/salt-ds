import {
  Display1,
  Display2,
  Display3,
  makePrefixer,
  Text,
} from "@salt-ds/core";
import { ArrowDownIcon, ArrowUpIcon, type IconProps } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentType, forwardRef, type HTMLAttributes } from "react";
import { useMetricContext } from "./internal";

import metricContentCss from "./MetricContent.css";

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
   * Other data that may serve as additional information to the main value
   */
  subvalue?: string | number;
  /**
   * The main value to display in the metric
   */
  value: string | number;
}

const iconComponentMap = {
  down: ArrowDownIcon,
  up: ArrowUpIcon,
};

const withBaseName = makePrefixer("saltMetricContent");

export const MetricContent = forwardRef<HTMLDivElement, MetricContentProps>(
  function MetricContent(
    {
      IndicatorIconProps,
      IndicatorIconComponent,
      className,
      value,
      subvalue,
      ...restProps
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-metric-content",
      css: metricContentCss,
      window: targetWindow,
    });

    const {
      direction,
      showIndicator,
      indicatorPosition,
      size = "medium",
      valueId,
      titleId,
      subtitleId,
    } = useMetricContext();

    const iconSize = size === "large" ? 2 : 1;

    const valueComponentMap = {
      small: Display3,
      medium: Display2,
      large: Display1,
    };
    const ValueComponent = valueComponentMap[size];

    const iconProps = {
      "aria-label": direction,
      className: withBaseName("indicator"),
      name: direction ? `movement-${direction}` : "",
      size: iconSize,
      ...IndicatorIconProps,
    };

    const IconComponent =
      IndicatorIconComponent ??
      (direction ? iconComponentMap[direction] : undefined);

    const icon =
      showIndicator && IconComponent ? <IconComponent {...iconProps} /> : null;

    return (
      <div
        {...restProps}
        className={clsx(withBaseName(), className)}
        aria-labelledby={`${titleId || ""} ${subtitleId || ""}`}
        ref={ref}
      >
        <div className={withBaseName("value-container")}>
          {indicatorPosition === "start" && icon}
          <ValueComponent
            data-testid="metric-value"
            id={valueId}
            className={withBaseName("value")}
          >
            {value}
          </ValueComponent>
          {indicatorPosition === "end" && icon}
        </div>
        {subvalue && (
          <Text
            className={withBaseName("subvalue")}
            data-testid="metric-subvalue"
          >
            {subvalue}
          </Text>
        )}
      </div>
    );
  },
);
