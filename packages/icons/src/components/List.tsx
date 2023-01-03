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
        <path d="M1 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm11-2H4v2h8V1Zm0 4H4v2h8V5ZM4 9h8v2H4V9ZM2 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </Icon>
    );
  }
);
