import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SearchSolidIconProps = IconProps;

export const SearchSolidIcon = forwardRef<SVGSVGElement, SearchSolidIconProps>(
  function SearchSolidIcon(props: SearchSolidIconProps, ref) {
    return (
      <Icon
        data-testid="SearchSolidIcon"
        aria-label="search solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M5 10a4.978 4.978 0 0 0 3-1l3 3 1-1-3-3a5 5 0 1 0-4 2Zm0-8a3 3 0 0 1 3 3h1a4 4 0 0 0-4-4v1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
