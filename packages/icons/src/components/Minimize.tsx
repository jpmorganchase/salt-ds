import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MinimizeIconProps = IconProps;

export const MinimizeIcon = forwardRef<SVGSVGElement, MinimizeIconProps>(
  function MinimizeIcon(props: MinimizeIconProps, ref) {
    return (
      <Icon
        data-testid="MinimizeIcon"
        aria-label="minimize"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 8h12v2H0V8z" />
      </Icon>
    );
  }
);
