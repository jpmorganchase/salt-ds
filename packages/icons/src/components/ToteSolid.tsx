// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ToteSolidIconProps = IconProps;

export const ToteSolidIcon = forwardRef<SVGSVGElement, ToteSolidIconProps>(
  function ToteSolidIcon(props: ToteSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ToteSolidIcon"
        aria-label="tote solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M4 4V3a2 2 0 1 1 4 0v1h4v8H0V4zm3-1v1H5V3a1 1 0 0 1 2 0m1 3H7v1h1zM4 6h1v1H4z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
