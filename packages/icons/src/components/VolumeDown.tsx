import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

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
        <path d="M3 4H0v4h3l3 3V1L3 4zm4 4.829a3.001 3.001 0 0 0 0-5.658V8.83z" />
      </Icon>
    );
  }
);
