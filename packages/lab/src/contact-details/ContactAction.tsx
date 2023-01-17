import { Button, ButtonProps, useForkRef } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
import { ComponentType, forwardRef } from "react";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

export type ContactActionProps = ButtonProps & {
  accessibleText?: string;
  tooltipProps?: TooltipProps;
} & (
    | {
      label: string;
      icon?: ComponentType<IconProps>;
    }
    | {
      label?: string;
      icon: ComponentType<IconProps>;
    }
  );

export const ContactAction = forwardRef<HTMLButtonElement, ContactActionProps>(
  function ContactAction(props, ref) {
    const { label, icon, accessibleText, tooltipProps, ...restProps } = props;

    const Icon = icon!;

    const { getTooltipProps, getTriggerProps } = useTooltip({
      placement: "top",
      disabled: !accessibleText,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps<typeof Button>(
      {
        variant: "secondary",
        ...restProps,
      }
    );

    const handleRef = useForkRef(triggerRef, ref);

    return (
      <Tooltip
        {...getTooltipProps({ text: accessibleText, ...tooltipProps })}
      >
        <Button {...triggerProps} ref={handleRef}>
          {label ? label : <Icon />}
        </Button>
      </Tooltip>
    );
  }
);
