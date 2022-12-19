import { IconProps } from "@salt-ds/icons";
import cx from "classnames";
import { ElementType } from "react";
<<<<<<< HEAD:packages/core/src/form-field/StatusIndicator.tsx
import { StatusIndicator as BaseStatusIndicator } from "../status-indicator";
import { Tooltip, TooltipProps } from "../tooltip";
import { makePrefixer } from "../utils";
=======
import {
  StatusIndicator as BaseStatusIndicator,
  makePrefixer,
} from "@salt-ds/core";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";
>>>>>>> main:packages/lab/src/form-field/StatusIndicator.tsx

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

  // const { getTriggerProps, getTooltipProps } = useTooltip({
  //   placement: "top",
  //   disabled: !hasTooltip,
  // });

  return (
    <TooltipComponent
      hideIcon={true}
      status={status}
      title={tooltipText}
      {...TooltipProps}
      // {...getTooltipProps({
      //   hideIcon: true,
      //   status,
      //   title: tooltipText,
      //   ...TooltipProps,
      // })}
    >
      <BaseStatusIndicator
        status={status}
        className={cx(
          withBaseName("statusIndicator"),
          className,
          IconProps?.className
        )}
        {...restProps}
        {...IconProps}
        // {...getTriggerProps<typeof BaseStatusIndicator>(
        // {
        // ...status,
        // ...restProps,
        // ...IconProps,
        //   className: cx(
        //     withBaseName("statusIndicator"),
        //     className,
        //     IconProps?.className
        //   ),
        // }
        // )}
      />
    </TooltipComponent>
  );
};
