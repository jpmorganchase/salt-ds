import { IconProps } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { ElementType } from "react";
import { StatusIcon } from "../status-icon";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

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

  const { getTriggerProps, getTooltipProps } = useTooltip({
    placement: "top",
    disabled: !hasTooltip,
  });

  return (
    <>
      <TooltipComponent
        {...getTooltipProps({
          hideIcon: true,
          state,
          title: tooltipText,
          ...TooltipProps,
        })}
      />
      <StatusIcon
        {...getTriggerProps<typeof StatusIcon>({
          status: state,
          size: 12,
          ...restProps,
          ...IconProps,
          className: cx(
            "uitkStatusIndicator-statusIcon",
            className,
            IconProps?.className
          ),
        })}
      />
    </>
  );
};
