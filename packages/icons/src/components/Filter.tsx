import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FilterIconProps = IconProps;

export const FilterIcon = forwardRef<SVGSVGElement, FilterIconProps>(
  function FilterIcon(props: FilterIconProps, ref) {
    return (
      <Icon
        data-testid="FilterIcon"
        aria-label="filter"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M7.5 7v5h-3V7L0 0h12L7.5 7zm-1 4V6.706L10.168 1H1.831l3.668 5.706V11h1z" />
      </Icon>
    );
  }
);
