// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

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
        <path d="M5 1H4v10h1V1ZM3 3H2v6h1V3Zm5 0h1v6H8V3ZM1 4H0v4h1V4Zm5 0h1v4H6V4Zm5 1h-1v2h1V5Z" />
      </Icon>
    );
  }
);