import { forwardRef } from "react";
import { Icon, IconProps } from "@salt-ds/icons";

export const RegularIcon = forwardRef<SVGSVGElement, IconProps>(
  function RegularIcon(props, ref) {
    return (
      <Icon
        aria-label="attach"
        role="img"
        viewBox="0 0 12 12"
        {...props}
        ref={ref}
      >
        <rect
          x="2"
          y="2"
          width="8"
          height="8"
          fill="#4C505B"
          fillOpacity="0.4"
        />
      </Icon>
    );
  }
);
