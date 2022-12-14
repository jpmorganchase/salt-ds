import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyOptionIconProps = IconProps;

export const KeyOptionIcon = forwardRef<SVGSVGElement, KeyOptionIconProps>(
  function KeyOptionIcon(props: KeyOptionIconProps, ref) {
    return (
      <Icon
        data-testid="KeyOptionIcon"
        aria-label="key option"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M4.14 2H1V1h3.86l3 9H11v1H7.14l-3-9ZM11 2H7V1h4v1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
