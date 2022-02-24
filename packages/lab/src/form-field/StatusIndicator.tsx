import React, { ElementType } from "react";
import cx from "classnames";
import { IconProps } from "@brandname/core";
import { Tooltip, TooltipProps } from "../tooltip";
// TODO: temporarily import from dialog internal before finding a better home
import { StateIcon } from "../dialog/internal/StateIcon";

export type StateIndicatorState = "error" | "info" | "warning" | "success";

// `statusIndicatorContent` is removed. It's not a very restrictive API only allowing string array.
// User always have ability to override `tooltipText` for string, or `TooltipProps.render` for complex structure.
export interface StatusIndicatorProps extends IconProps {
  hasTooltip?: boolean;
  IconProps?: Partial<IconProps>;
  state?: StateIndicatorState;
  TooltipComponent?: ElementType<TooltipProps>;
  TooltipProps?: Partial<TooltipProps>;
  tooltipText?: string;
}

export const StatusIndicator = (props: StatusIndicatorProps) => {
  const {
    TooltipComponent = Tooltip,
    hasTooltip = false,
    TooltipProps,
    tooltipText,
    IconProps,
    className,
    state = "info",
    ...restProps
  } = props;

  const icon = (
    <StateIcon
      state={state}
      size={12}
      {...restProps}
      {...IconProps}
      className={cx(
        "uitkStatusIndicator-stateIcon",
        className,
        IconProps?.className
      )}
    />
  );
  return hasTooltip ? (
    <TooltipComponent
      hideIcon
      placement="top"
      state={state}
      title={tooltipText}
      {...TooltipProps}
    >
      {icon}
    </TooltipComponent>
  ) : (
    icon
  );
};
