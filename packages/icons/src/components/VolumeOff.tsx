import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VolumeOffIconProps = IconProps;

export const VolumeOffIcon = forwardRef<SVGSVGElement, VolumeOffIconProps>(
  function VolumeOffIcon(props: VolumeOffIconProps, ref) {
    return (
      <Icon
        data-testid="VolumeOffIcon"
        aria-label="volume off"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M0 4h3l3-3v10L3 8H0V4z" />
          <path d="M11.286 8.5 9.5 6.714 7.714 8.5 7 7.786 8.786 6 7 4.214l.714-.714L9.5 5.286 11.286 3.5l.714.714L10.214 6 12 7.786l-.714.714z" />
        </>
      </Icon>
    );
  }
);
