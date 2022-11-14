import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TreeIconProps = IconProps;

export const TreeIcon = forwardRef<SVGSVGElement, TreeIconProps>(
  function TreeIcon(props: TreeIconProps, ref) {
    return (
      <Icon
        data-testid="TreeIcon"
        aria-label="tree"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 5V1h4v4H6.5v1H11v2h1v4H8V8h2V7H2v1h2v4H0V8h1V6h4.5V5H4zm3-3H5v2h2V2zm2 7v2h2V9H9zM1 9v2h2V9H1z" />
      </Icon>
    );
  }
);
