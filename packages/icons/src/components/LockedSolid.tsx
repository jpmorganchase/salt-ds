import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LockedSolidIconProps = IconProps;

export const LockedSolidIcon = forwardRef<SVGSVGElement, LockedSolidIconProps>(
  function LockedSolidIcon(props: LockedSolidIconProps, ref) {
    return (
      <Icon
        data-testid="LockedSolidIcon"
        aria-label="locked solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 4H0v8h12V4h-2V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2zm1-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H3V2zm4.5 5.5a1.5 1.5 0 0 1-1 1.415V10h-1V8.915a1.5 1.5 0 1 1 2-1.415z" />
      </Icon>
    );
  }
);
