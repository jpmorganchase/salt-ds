// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LaptopIconProps = IconProps;

export const LaptopIcon = forwardRef<SVGSVGElement, LaptopIconProps>(
  function LaptopIcon(props: LaptopIconProps, ref) {
    return (
      <Icon
        data-testid="LaptopIcon"
        aria-label="laptop"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M10 2H2v6h8V2ZM1 1v8h10V1H1Zm11 10H0v-1h12v1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
