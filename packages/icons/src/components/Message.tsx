import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MessageIconProps = IconProps;

export const MessageIcon = forwardRef<SVGSVGElement, MessageIconProps>(
  function MessageIcon(props: MessageIconProps, ref) {
    return (
      <Icon
        data-testid="MessageIcon"
        aria-label="message"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 1v10H0V1h12zM1 2.504l5 3.864 5-3.864V2H1v.504zm0 1.264V10h10V3.768L6 7.632 1 3.768z" />
      </Icon>
    );
  }
);
