import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TriangleUpIconProps = IconProps;

export const TriangleUpIcon = forwardRef<SVGSVGElement, TriangleUpIconProps>(
  function TriangleUpIcon(props: TriangleUpIconProps, ref) {
    return (
      <Icon
        data-testid="TriangleUpIcon"
        aria-label="triangle up"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m6 3.5-5 5h10l-5-5z" />
      </Icon>
    );
  }
);
