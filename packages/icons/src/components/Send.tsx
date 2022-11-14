import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SendIconProps = IconProps;

export const SendIcon = forwardRef<SVGSVGElement, SendIconProps>(
  function SendIcon(props: SendIconProps, ref) {
    return (
      <Icon
        data-testid="SendIcon"
        aria-label="send"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1.091 7 0 12l12-6L0 0l1.091 5L6 6 1.091 7z" />
      </Icon>
    );
  }
);
