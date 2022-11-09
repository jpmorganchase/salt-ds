import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ListIconProps = IconProps;

export const ListIcon = forwardRef<SVGSVGElement, ListIconProps>(
  function ListIcon(props: ListIconProps, ref) {
    return (
      <Icon
        data-testid="ListIcon"
        aria-label="list"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm11-2H4v2h8V1zm0 4H4v2h8V5zM4 9h8v2H4V9zM2 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      </Icon>
    );
  }
);
