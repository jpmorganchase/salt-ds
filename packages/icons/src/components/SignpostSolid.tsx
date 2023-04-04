// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SignpostSolidIconProps = IconProps;

export const SignpostSolidIcon = forwardRef<
  SVGSVGElement,
  SignpostSolidIconProps
>(function SignpostSolidIcon(props: SignpostSolidIconProps, ref) {
  return (
    <Icon
      data-testid="SignpostSolidIcon"
      aria-label="signpost solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <g clipPath="url(#a)">
        <path d="M5 0h1v1h4.067L12 3l-1.933 2H6v7H5V7H1.933L0 5l1.933-2H5V0Z" />
      </g>
      <defs>
        <clipPath id="a">
          <path d="M0 0h12v12H0z" />
        </clipPath>
      </defs>
    </Icon>
  );
});
