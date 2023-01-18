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
        <path
          fillRule="evenodd"
          d="m0 5 2 2 2 1 1 2 2 2 5-12L0 5Zm4.981 2.726.84 1.682.83.829 2.987-7.168L4.98 7.726Zm3.95-5.364L1.763 5.35l.83.83 1.681.84 4.657-4.657Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
