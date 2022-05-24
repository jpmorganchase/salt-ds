import {
  ComponentType,
  forwardRef,
  HTMLAttributes,
  useCallback,
  useRef,
} from "react";
import cx from "classnames";
import { makePrefixer, IconProps } from "@jpmorganchase/uitk-core";
import { Div, Figure1, Figure2, Figure3 } from "@jpmorganchase/uitk-lab";
import { ArrowUpIcon, ArrowDownIcon } from "@jpmorganchase/uitk-icons";
import { useForkRef } from "../utils";
import { useMetricContext } from "./internal";

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
      ...restProps
    },
    ref
  ) {
    const {
      direction,
      showIndicator,
      indicatorPosition,
      size,
      valueId,
      titleId,
      subtitleId,
    } = useMetricContext();

    const contentRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef<HTMLDivElement>(ref, contentRef);

    const iconSize = size === "small" ? 12 : 24;
    const ValueComponent =
      size === "small" ? Figure3 : size === "large" ? Figure1 : Figure2;

    const iconProps = {
      "aria-label": direction,
      className: withBaseName("indicator"),
      "data-testid": "metric-indicator",
      name: direction ? `movement-${direction}` : "",
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
        className={cx(withBaseName(), className)}
        ref={handleRef}
        aria-labelledby={`${titleId || ""} ${subtitleId || ""}`}
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
          <Div
            className={withBaseName("subvalue")}
            data-testid="metric-subvalue"
          >
            {subvalue}
          </Div>
        )}
      </div>
    );
  }
);
