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
        <path
          fillRule="evenodd"
          d="M8.567 10.67a5.625 5.625 0 1 1 2.06-2.22L12 12l-3.433-1.33ZM.978 5.876a4.647 4.647 0 1 1 8.556 2.513l.41 1.091.28.745-.724-.272-1.041-.394a4.647 4.647 0 0 1-7.48-3.683Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
