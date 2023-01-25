import { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import { ElementType } from "react";
import {
  StatusIndicator as BaseStatusIndicator,
  makePrefixer,
} from "@salt-ds/core";
import { Tooltip, TooltipProps } from "../tooltip";

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

  return (
    <TooltipComponent
      hideIcon={true}
      status={status}
      content={tooltipText}
      placement="top"
      disabled={!hasTooltip}
      disablePortal={false}
      {...TooltipProps}
    >
      <BaseStatusIndicator
        status={status}
        {...restProps}
        {...IconProps}
        className={clsx(
          withBaseName("statusIndicator"),
          className,
          IconProps?.className
        )}
      />
    </TooltipComponent>
  );
};
