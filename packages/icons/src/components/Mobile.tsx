// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MobileIconProps = IconProps;

export const MobileIcon = forwardRef<SVGSVGElement, MobileIconProps>(
  function MobileIcon(props: MobileIconProps, ref) {
    return (
      <Icon
        data-testid="MobileIcon"
        aria-label="mobile"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Zm6-1H4a1 1 0 0 0-1 1h6a1 1 0 0 0-1-1Zm1 8V3H3v6h6Zm-6 1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1H3Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
