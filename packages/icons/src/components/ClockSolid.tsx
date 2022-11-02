import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ClockSolidIconProps = IconProps;

export const ClockSolidIcon = forwardRef<SVGSVGElement, ClockSolidIconProps>(
  function ClockSolidIcon(props: ClockSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ClockSolidIcon"
        aria-label="clock solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0zM6 3v3H3v1h4V3H6z" />
      </Icon>
    );
  }
);
