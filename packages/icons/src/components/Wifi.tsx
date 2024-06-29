// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type WifiIconProps = IconProps;

export const WifiIcon = forwardRef<SVGSVGElement, WifiIconProps>(
  function WifiIcon(props: WifiIconProps, ref) {
    return (
      <Icon
        data-testid="WifiIcon"
        aria-label="wifi"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 2c2.262 0 4.304.939 5.76 2.447l-.655.764A6.98 6.98 0 0 0 6 3 6.98 6.98 0 0 0 .895 5.21L.24 4.448A7.977 7.977 0 0 1 6 2Z" />
        <path d="M6 4c1.765 0 3.352.762 4.45 1.975l-.657.767A4.989 4.989 0 0 0 6 5a4.989 4.989 0 0 0-3.793 1.742l-.657-.767A5.985 5.985 0 0 1 6 4Z" />
        <path d="M6 6c1.269 0 2.4.59 3.132 1.512l-.667.778A2.997 2.997 0 0 0 6 7c-1.021 0-1.924.51-2.465 1.29l-.667-.778A3.993 3.993 0 0 1 6 6Zm1 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
      </Icon>
    );
  },
);
