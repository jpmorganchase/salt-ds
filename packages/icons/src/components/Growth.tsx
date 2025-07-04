// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type GrowthIconProps = IconProps;

export const GrowthIcon = forwardRef<SVGSVGElement, GrowthIconProps>(
  function GrowthIcon(props: GrowthIconProps, ref) {
    return (
      <Icon
        data-testid="GrowthIcon"
        aria-label="growth"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 6.5h-1V3.707l-4 4-2-2L.854 9.854l-.708-.708L5 4.293l2 2L10.293 3H7.5V2H12z" />
      </Icon>
    );
  },
);
