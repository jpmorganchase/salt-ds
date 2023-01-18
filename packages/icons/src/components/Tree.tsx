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
        <path
          fillRule="evenodd"
          d="M4 5h1.5v1H1v2H0v4h4V8H2V7h8v1H8v4h4V8h-1V6H6.5V5H8V1H4v4Zm3-3H5v2h2V2Zm2 7v2h2V9H9ZM1 9v2h2V9H1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
