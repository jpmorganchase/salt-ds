// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type WaveformIconProps = IconProps;

export const WaveformIcon = forwardRef<SVGSVGElement, WaveformIconProps>(
  function WaveformIcon(props: WaveformIconProps, ref) {
    return (
      <Icon
        data-testid="WaveformIcon"
        aria-label="waveform"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 1H4v10h1zM3 3H2v6h1zm5 0h1v6H8zM1 4H0v4h1zm5 0h1v4H6zm5 1h-1v2h1z" />
      </Icon>
    );
  },
);
