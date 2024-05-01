// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FilterClearIconProps = IconProps;

export const FilterClearIcon = forwardRef<SVGSVGElement, FilterClearIconProps>(
  function FilterClearIcon(props: FilterClearIconProps, ref) {
    return (
      <Icon
        data-testid="FilterClearIcon"
        aria-label="filter clear"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6.714 6 8.5 4.214 7.786 3.5 6 5.286 4.214 3.5l-.714.714L5.286 6 3.5 7.786l.714.714L6 6.714 7.786 8.5l.714-.714L6.714 6ZM6.5 8.628l1 1V12h-3V9.629l1-1V11h1V8.628Z" />
        <path d="m3.871 6-.008.009-.032-.05.04.041Zm-.682-2.889-.724.724L0 0h12L9.535 3.835 8.81 3.11 10.168 1H1.832l1.357 2.111Zm4.948 2.898.032-.05-.04.041.008.009Z" />
      </Icon>
    );
  }
);
