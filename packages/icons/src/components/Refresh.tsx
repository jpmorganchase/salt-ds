import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RefreshIconProps = IconProps;

export const RefreshIcon = forwardRef<SVGSVGElement, RefreshIconProps>(
  function RefreshIcon(props: RefreshIconProps, ref) {
    return (
      <Icon
        data-testid="RefreshIcon"
        aria-label="refresh"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 4 3 2a5.002 5.002 0 0 0 2 8.9v1.017a6.001 6.001 0 0 1-2.713-10.63L1 0h4v4zm2 4 2 2a5.002 5.002 0 0 0-2-8.9V.083a6.001 6.001 0 0 1 2.713 10.63L11 12H7V8z" />
      </Icon>
    );
  }
);
