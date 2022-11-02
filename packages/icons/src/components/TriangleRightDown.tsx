import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TriangleRightDownIconProps = IconProps;

export const TriangleRightDownIcon = forwardRef<
  SVGSVGElement,
  TriangleRightDownIconProps
>(function TriangleRightDownIcon(props: TriangleRightDownIconProps, ref) {
  return (
    <Icon
      data-testid="TriangleRightDownIcon"
      aria-label="triangle right down"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M9.5 9.5v-7l-7 7h7z" />
    </Icon>
  );
});
