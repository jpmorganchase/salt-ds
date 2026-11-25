import {
  Button,
  type ButtonProps,
  Tooltip,
  type TooltipProps,
} from "@salt-ds/core";
import type { IconProps } from "@salt-ds/icons";
import { type ComponentType, forwardRef } from "react";

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
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

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [contact details pattern](https://www.saltdesignsystem.com/salt/patterns/contact-details) instead.
 */
export const ContactAction = forwardRef<HTMLButtonElement, ContactActionProps>(
  function ContactAction(props, ref) {
    const { label, icon, accessibleText, tooltipProps, ...restProps } = props;

    const Icon = icon;

    return (
      <Tooltip
        placement="top"
        disabled={!accessibleText}
        content={accessibleText}
        {...tooltipProps}
      >
        <Button variant="secondary" ref={ref} {...restProps}>
          {label ? label : Icon ? <Icon /> : null}
        </Button>
      </Tooltip>
    );
  },
);
