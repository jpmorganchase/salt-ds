import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChatSolidIconProps = IconProps;

export const ChatSolidIcon = forwardRef<SVGSVGElement, ChatSolidIconProps>(
  function ChatSolidIcon(props: ChatSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ChatSolidIcon"
        aria-label="chat solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5.625.25a5.624 5.624 0 1 0 0 11.25 5.602 5.602 0 0 0 2.942-.829l3.366 1.262-1.306-3.482A5.624 5.624 0 0 0 5.625.25z" />
      </Icon>
    );
  }
);
