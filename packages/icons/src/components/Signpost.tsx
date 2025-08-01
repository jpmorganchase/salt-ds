// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SignpostIconProps = IconProps;

export const SignpostIcon = forwardRef<SVGSVGElement, SignpostIconProps>(
  function SignpostIcon(props: SignpostIconProps, ref) {
    return (
      <Icon
        data-testid="SignpostIcon"
        aria-label="signpost"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M5 0h1v1h4.067L12 3l-1.933 2H6v7H5V7H1.933L0 5l1.933-2H5zm1 4h3.666l.967-1-.967-1H6zM5 4H2.334l-.967 1 .967 1H5z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
