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
        <path d="M5.625.25a5.625 5.625 0 1 0 2.942 10.42L12 12l-1.373-3.55A5.625 5.625 0 0 0 5.625.25Z" />
      </Icon>
    );
  }
);
