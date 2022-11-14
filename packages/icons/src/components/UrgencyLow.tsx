import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UrgencyLowIconProps = IconProps;

export const UrgencyLowIcon = forwardRef<SVGSVGElement, UrgencyLowIconProps>(
  function UrgencyLowIcon(props: UrgencyLowIconProps, ref) {
    return (
      <Icon
        data-testid="UrgencyLowIcon"
        aria-label="urgency low"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="m6 3.5 5.3 3.684-.575.816L6 4.715 1.275 8 .7 7.184 6 3.5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
