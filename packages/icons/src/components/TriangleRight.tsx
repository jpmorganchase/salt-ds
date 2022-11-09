import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TriangleRightIconProps = IconProps;

export const TriangleRightIcon = forwardRef<
  SVGSVGElement,
  TriangleRightIconProps
>(function TriangleRightIcon(props: TriangleRightIconProps, ref) {
  return (
    <Icon
      data-testid="TriangleRightIcon"
      aria-label="triangle right"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="m8.5 6-5-5v10l5-5z" />
    </Icon>
  );
});
