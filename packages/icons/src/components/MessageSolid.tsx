import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MessageSolidIconProps = IconProps;

export const MessageSolidIcon = forwardRef<
  SVGSVGElement,
  MessageSolidIconProps
>(function MessageSolidIcon(props: MessageSolidIconProps, ref) {
  return (
    <Icon
      data-testid="MessageSolidIcon"
      aria-label="message solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M12 1v10H0V1h12zM2.1 3.354l-.611.791 4.512 3.486 4.512-3.486-.611-.791-3.9 3.014-3.9-3.014z" />
    </Icon>
  );
});
