import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GridIconProps = IconProps;

export const GridIcon = forwardRef<SVGSVGElement, GridIconProps>(
  function GridIcon(props: GridIconProps, ref) {
    return (
      <Icon
        data-testid="GridIcon"
        aria-label="grid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M0 5h5V0H0v5zm1-4h3v3H1V1z" />
          <path d="M7 5h5V0H7v5zm1-4h3v3H8V1z" />
          <path d="M7 7h5v5H7V7zm4 1H8v3h3V8z" />
          <path d="M0 12h5V7H0v5zm1-4h3v3H1V8z" />
        </>
      </Icon>
    );
  }
);
