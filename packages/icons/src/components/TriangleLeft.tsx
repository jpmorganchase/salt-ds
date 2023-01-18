import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TriangleLeftIconProps = IconProps;

export const TriangleLeftIcon = forwardRef<
  SVGSVGElement,
  TriangleLeftIconProps
>(function TriangleLeftIcon(props: TriangleLeftIconProps, ref) {
  return (
    <Icon
      data-testid="TriangleLeftIcon"
      aria-label="triangle left"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="m3.5 6 5 5V1l-5 5Z" />
    </Icon>
  );
});
