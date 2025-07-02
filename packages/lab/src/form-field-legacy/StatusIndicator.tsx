import {
  StatusIndicator as BaseStatusIndicator,
  makePrefixer,
  Tooltip,
  type TooltipProps,
} from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { clsx } from "clsx";
import type { ElementType } from "react";

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
      hideIcon
      status={status}
      content={tooltipText}
      placement="top"
      disabled={!hasTooltip}
      {...TooltipProps}
    >
      <BaseStatusIndicator
        status={status}
        {...restProps}
        {...IconProps}
        className={clsx(
          withBaseName("statusIndicator"),
          className,
          IconProps?.className,
        )}
      />
    </TooltipComponent>
  );
};
