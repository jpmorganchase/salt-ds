import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ArrowDownIconProps = IconProps;

export const ArrowDownIcon = forwardRef<SVGSVGElement, ArrowDownIconProps>(
  function ArrowDownIcon(props: ArrowDownIconProps, ref) {
    return (
      <Icon
        data-testid="ArrowDownIcon"
        aria-label="arrow down"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M7 8V0H5v8H2l4 4 4-4H7z" />
      </Icon>
    );
  }
);
