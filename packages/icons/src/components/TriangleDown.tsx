// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type TriangleDownIconProps = IconProps;

export const TriangleDownIcon = forwardRef<
  SVGSVGElement,
  TriangleDownIconProps
>(function TriangleDownIcon(props: TriangleDownIconProps, ref) {
  return (
    <Icon
      data-testid="TriangleDownIcon"
      aria-label="triangle down"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="m6 8.5 5-5H1z" />
    </Icon>
  );
});
