// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type VolumeDownIconProps = IconProps;

export const VolumeDownIcon = forwardRef<SVGSVGElement, VolumeDownIconProps>(
  function VolumeDownIcon(props: VolumeDownIconProps, ref) {
    return (
      <Icon
        data-testid="VolumeDownIcon"
        aria-label="volume down"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 4H0v4h3l3 3V1L3 4Zm4 4.83a3.001 3.001 0 0 0 0-5.66v5.66Z" />
      </Icon>
    );
  },
);
