import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ChevronDownIconProps = IconProps;

export const ChevronDownIcon = forwardRef<SVGSVGElement, ChevronDownIconProps>(
  function ChevronDownIcon(props: ChevronDownIconProps, ref) {
    return (
      <Icon
        data-testid="ChevronDownIcon"
        aria-label="chevron down"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 7.308 10.401 2.5l1.099.992L6 9.5.5 3.492 1.599 2.5 6 7.308z" />
      </Icon>
    );
  }
);
