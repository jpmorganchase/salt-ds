import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UnlockedIconProps = IconProps;

export const UnlockedIcon = forwardRef<SVGSVGElement, UnlockedIconProps>(
  function UnlockedIcon(props: UnlockedIconProps, ref) {
    return (
      <Icon
        data-testid="UnlockedIcon"
        aria-label="unlocked"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M7.5 7.5a1.5 1.5 0 0 1-1 1.415V10h-1V8.915a1.5 1.5 0 1 1 2-1.415z" />
        <path d="M3 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h1a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2H0v8h12V4H3V2zm-2 9V5h10v6H1z" />
      </Icon>
    );
  }
);
