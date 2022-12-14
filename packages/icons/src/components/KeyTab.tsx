import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyTabIconProps = IconProps;

export const KeyTabIcon = forwardRef<SVGSVGElement, KeyTabIconProps>(
  function KeyTabIcon(props: KeyTabIconProps, ref) {
    return (
      <Icon
        data-testid="KeyTabIcon"
        aria-label="key tab"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M10 7.102V10h1V2h-1v2.898L6.83 2.124l-.66.752 3 2.624H1v1h8.17l-3 2.624.66.752L10 7.102Z" />
      </Icon>
    );
  }
);
