import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SearchIconProps = IconProps;

export const SearchIcon = forwardRef<SVGSVGElement, SearchIconProps>(
  function SearchIcon(props: SearchIconProps, ref) {
    return (
      <Icon
        data-testid="SearchIcon"
        aria-label="search"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M8 9a5 5 0 1 1 1-1l3 3-1 1-3-3Zm1-4a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
