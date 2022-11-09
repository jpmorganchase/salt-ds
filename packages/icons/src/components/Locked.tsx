import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LockedIconProps = IconProps;

export const LockedIcon = forwardRef<SVGSVGElement, LockedIconProps>(
  function LockedIcon(props: LockedIconProps, ref) {
    return (
      <Icon
        data-testid="LockedIcon"
        aria-label="locked"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6.5 8.915a1.5 1.5 0 1 0-1 0V10h1V8.915z" />
        <path d="M2 4H0v8h12V4h-2V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2zm1-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H3V2zm-2 9V5h10v6H1z" />
      </Icon>
    );
  }
);
