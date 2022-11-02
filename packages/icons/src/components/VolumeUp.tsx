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
        <>
          <path d="M3 4H0v4h3l3 3V1L3 4z" />
          <path d="M12 6C12 2.985 9.838.483 7 0v1.55c2.004.461 3.5 2.278 3.5 4.45S9.004 9.989 7 10.45V12c2.838-.483 5-2.985 5-6z" />
          <path d="M7 8.829a3.001 3.001 0 0 0 0-5.658V8.83z" />
        </>
      </Icon>
    );
  }
);
