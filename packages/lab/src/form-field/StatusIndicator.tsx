import { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import { ElementType } from "react";
import {
  StatusIndicator as BaseStatusIndicator,
  makePrefixer,
} from "@salt-ds/core";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

const withBaseName = makePrefixer("saltFormField");

export type StatusIndicatorStatus = "error" | "info" | "warning" | "success";

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
      <BaseStatusIndicator
        {...getTriggerProps<typeof BaseStatusIndicator>({
          status,
          ...restProps,
          ...IconProps,
          className: clsx(
            withBaseName("statusIndicator"),
            className,
            IconProps?.className
          ),
        })}
      />
    </>
  );
};
