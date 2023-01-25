import { Button, ButtonProps } from "@salt-ds/core";
import { IconProps } from "@salt-ds/icons";
import { ComponentType, forwardRef } from "react";
import { Tooltip, TooltipProps } from "../tooltip";

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

    return (
      <Tooltip
        placement="top"
        disabled={!accessibleText}
        content={accessibleText}
      >
        <Button variant="secondary" ref={ref} {...restProps}>
          {label ? label : <Icon />}
        </Button>
      </Tooltip>
    );
  }
);
