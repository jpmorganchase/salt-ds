import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GridSolidIconProps = IconProps;

export const GridSolidIcon = forwardRef<SVGSVGElement, GridSolidIconProps>(
  function GridSolidIcon(props: GridSolidIconProps, ref) {
    return (
      <Icon
        data-testid="GridSolidIcon"
        aria-label="grid solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 0h5v5H0V0zm7 5V0h5v5H7zm0 2v5h5V7H7zM0 7h5v5H0V7z" />
      </Icon>
    );
  }
);
