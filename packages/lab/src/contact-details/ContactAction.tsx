import { ComponentType, forwardRef } from "react";
import { IconProps, Button, ButtonProps } from "@brandname/core";

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

    const renderContent = () => {
      return (
        <Button variant="secondary" ref={ref} {...restProps}>
          {label ? label : <Icon />}
        </Button>
      );
    };

    if (accessibleText) {
      return (
        <Tooltip placement="top" title={accessibleText} {...tooltipProps}>
          {renderContent()}
        </Tooltip>
      );
    }
    return renderContent();
  }
);
