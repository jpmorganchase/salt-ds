import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CloneIconProps = IconProps;

export const CloneIcon = forwardRef<SVGSVGElement, CloneIconProps>(
  function CloneIcon(props: CloneIconProps, ref) {
    return (
      <Icon
        data-testid="CloneIcon"
        aria-label="clone"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 3h1V1h3V0H0v3zm3 2h1V4h7v7H4v-1H3v2h9V3H3v2zm3-4V0h4v2H9V1H6z" />
        <path d="M0 5h1v2h5V5l3 2.5L6 10V8H0V5z" />
      </Icon>
    );
  }
);
