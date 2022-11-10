import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChatGroupIconProps = IconProps;

export const ChatGroupIcon = forwardRef<SVGSVGElement, ChatGroupIconProps>(
  function ChatGroupIcon(props: ChatGroupIconProps, ref) {
    return (
      <Icon
        data-testid="ChatGroupIcon"
        aria-label="chat group"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6.557 9.452a3.535 3.535 0 0 0 1.816.547 3.54 3.54 0 0 0 1.804-.446l1.733.436-.254-2.011a3.545 3.545 0 0 0-3.492-5.055 4.48 4.48 0 0 0-3.782-1.922A4.48 4.48 0 0 0 .434 7.404L.113 9.946l2.191-.551a4.463 4.463 0 0 0 2.28.563 4.476 4.476 0 0 0 1.973-.505zM2.444 8.328l-1.156.291.174-1.381-.126-.265A3.48 3.48 0 0 1 4.404 2a3.478 3.478 0 0 1 2.692 1.179A3.545 3.545 0 0 0 5.73 8.728a3.488 3.488 0 0 1-2.941-.208l-.346-.193zm7.592.159-.346.193a2.544 2.544 0 1 1-1.181-4.767 2.544 2.544 0 0 1 2.244 3.636l-.126.265.107.85-.698-.176z" />
      </Icon>
    );
  }
);
