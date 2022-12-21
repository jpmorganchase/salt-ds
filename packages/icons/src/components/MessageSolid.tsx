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
      <path
        fillRule="evenodd"
        d="M12 1H0v10h12V1ZM2.1 3.354l-.612.792L6 7.632l4.512-3.486-.612-.792L6 6.368 2.1 3.354Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
