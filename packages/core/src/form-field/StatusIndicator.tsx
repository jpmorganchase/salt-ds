import { IconProps } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { ElementType } from "react";
import { StatusIcon } from "../status-icon";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

export type StatusIndicatorStatus = "error" | "info" | "warning" | "success";

// `statusIndicatorContent` is removed. It's not a very restrictive API only allowing string array.
// User always have ability to override `tooltipText` for string, or `TooltipProps.render` for complex structure.
export interface StatusIndicatorProps extends IconProps {
  hasTooltip?: boolean;
  IconProps?: Partial<IconProps>;
  status?: StatusIndicatorStatus;
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
    status = "info",
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
          status,
          title: tooltipText,
          ...TooltipProps,
        })}
      />
      <StatusIcon
        {...getTriggerProps<typeof StatusIcon>({
          status,
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
