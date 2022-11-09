import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UrgencyNoneIconProps = IconProps;

export const UrgencyNoneIcon = forwardRef<SVGSVGElement, UrgencyNoneIconProps>(
  function UrgencyNoneIcon(props: UrgencyNoneIconProps, ref) {
    return (
      <Icon
        data-testid="UrgencyNoneIcon"
        aria-label="urgency none"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M11 4H1v1h10V4Zm0 3H1v1h10V7Z" />
      </Icon>
    );
  }
);
