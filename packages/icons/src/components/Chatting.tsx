import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChattingIconProps = IconProps;

export const ChattingIcon = forwardRef<SVGSVGElement, ChattingIconProps>(
  function ChattingIcon(props: ChattingIconProps, ref) {
    return (
      <Icon
        data-testid="ChattingIcon"
        aria-label="chatting"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M5.531 6.933c.555 0 1.006-.46 1.006-1.027s-.45-1.027-1.006-1.027c-.555 0-1.006.46-1.006 1.027s.45 1.027 1.006 1.027z" />
          <path d="M3.771 5.906c0 .567-.45 1.027-1.006 1.027s-1.006-.46-1.006-1.027.45-1.027 1.006-1.027 1.006.46 1.006 1.027z" />
          <path d="M8.296 6.933c.555 0 1.006-.46 1.006-1.027s-.45-1.027-1.006-1.027c-.555 0-1.006.46-1.006 1.027s.45 1.027 1.006 1.027z" />
          <path d="M5.657 11.555C2.533 11.555 0 8.968 0 5.777S2.533-.001 5.657-.001s5.657 2.587 5.657 5.778c0 .953-.226 1.853-.626 2.646L12.001 12l-3.385-1.297a5.547 5.547 0 0 1-2.958.852zm0-10.55C3.076 1.005.984 3.142.984 5.778s2.092 4.773 4.673 4.773a4.585 4.585 0 0 0 2.849-.99l1.047.405.728.279L10 9.479l-.412-1.12c.469-.744.742-1.63.742-2.581 0-2.636-2.092-4.773-4.673-4.773z" />
        </>
      </Icon>
    );
  }
);
