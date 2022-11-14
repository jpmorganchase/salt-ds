import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FilterSolidIconProps = IconProps;

export const FilterSolidIcon = forwardRef<SVGSVGElement, FilterSolidIconProps>(
  function FilterSolidIcon(props: FilterSolidIconProps, ref) {
    return (
      <Icon
        data-testid="FilterSolidIcon"
        aria-label="filter solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M7.5 7 12 0H0l4.5 7v5h3V7z" />
      </Icon>
    );
  }
);
