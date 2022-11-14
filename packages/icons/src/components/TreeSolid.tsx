import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TreeSolidIconProps = IconProps;

export const TreeSolidIcon = forwardRef<SVGSVGElement, TreeSolidIconProps>(
  function TreeSolidIcon(props: TreeSolidIconProps, ref) {
    return (
      <Icon
        data-testid="TreeSolidIcon"
        aria-label="tree solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 1v4h1.5v1H1v2H0v4h4V8H2V7h8v1H8v4h4V8h-1V6H6.5V5H8V1H4z" />
      </Icon>
    );
  }
);
