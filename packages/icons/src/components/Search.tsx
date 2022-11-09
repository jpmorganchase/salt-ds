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
        <path d="M8.597 7.537a4.751 4.751 0 1 0-1.061 1.061l3.224 3.224 1.061-1.061-3.224-3.224zM7.048 2.452a3.25 3.25 0 1 1-4.597 4.596 3.25 3.25 0 0 1 4.597-4.596z" />
      </Icon>
    );
  }
);
