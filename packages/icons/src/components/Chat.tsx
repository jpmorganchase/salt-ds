import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChatIconProps = IconProps;

export const ChatIcon = forwardRef<SVGSVGElement, ChatIconProps>(
  function ChatIcon(props: ChatIconProps, ref) {
    return (
      <Icon
        data-testid="ChatIcon"
        aria-label="chat"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m8.567 10.67 3.366 1.262-1.306-3.482A5.624 5.624 0 1 0 0 5.874a5.624 5.624 0 0 0 8.567 4.796zM.978 5.875a4.647 4.647 0 1 1 8.557 2.513l.41 1.091v-.001l.28.746-.724-.272-1.041-.394A4.647 4.647 0 0 1 .979 5.875z" />
      </Icon>
    );
  }
);
