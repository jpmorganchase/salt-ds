// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ArrowRightIconProps = IconProps;

export const ArrowRightIcon = forwardRef<SVGSVGElement, ArrowRightIconProps>(
  function ArrowRightIcon(props: ArrowRightIconProps, ref) {
    return (
      <Icon
        data-testid="ArrowRightIcon"
        aria-label="arrow right"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 5.5v1h10.086L6.94 9.647l.707.707L12 6 7.647 1.647l-.707.707L10.086 5.5z" />
      </Icon>
    );
  },
);
