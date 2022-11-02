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
        <>
          <path d="M1 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          <path d="M12 1H4v2h8V1z" />
          <path d="M12 5H4v2h8V5z" />
          <path d="M4 9h8v2H4V9z" />
          <path d="M2 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          <path d="M1 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </>
      </Icon>
    );
  }
);
