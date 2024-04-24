// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PauseSolidIconProps = IconProps;

export const PauseSolidIcon = forwardRef<SVGSVGElement, PauseSolidIconProps>(
  function PauseSolidIcon(props: PauseSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PauseSolidIcon"
        aria-label="pause solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 0h3v12H2V0Zm5 0h3v12H7V0Z" />
      </Icon>
    );
  }
);
