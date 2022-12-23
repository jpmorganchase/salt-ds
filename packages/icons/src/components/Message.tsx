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
        <path
          fillRule="evenodd"
          d="M12 1H0v10h12V1ZM1 2.504V2h10v.504L6 6.368 1 2.504Zm0 1.264V10h10V3.768L6 7.632 1 3.768Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
