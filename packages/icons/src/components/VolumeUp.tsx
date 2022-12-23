import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VolumeUpIconProps = IconProps;

export const VolumeUpIcon = forwardRef<SVGSVGElement, VolumeUpIconProps>(
  function VolumeUpIcon(props: VolumeUpIconProps, ref) {
    return (
      <Icon
        data-testid="VolumeUpIcon"
        aria-label="volume up"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 4H0v4h3l3 3V1L3 4Zm4 4.83a3.001 3.001 0 0 0 0-5.66v5.66Z" />
        <path
          fillRule="evenodd"
          d="M7 10.389a4.502 4.502 0 0 0 0-8.777V.083a6.002 6.002 0 0 1 0 11.834v-1.528Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
