import { IconProps } from "@jpmorganchase/uitk-icons";
import cx from "classnames";
import { ElementType } from "react";
import {
  StatusIndicator as BaseStatusIndicator,
  makePrefixer,
} from "@jpmorganchase/uitk-core";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

const withBaseName = makePrefixer("uitkFormField");

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
          className: cx(
            withBaseName("statusIndicator"),
            className,
            IconProps?.className
          ),
        })}
      />
    </>
  );
};
