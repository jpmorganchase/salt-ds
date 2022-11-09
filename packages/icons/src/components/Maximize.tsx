import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MaximizeIconProps = IconProps;

export const MaximizeIcon = forwardRef<SVGSVGElement, MaximizeIconProps>(
  function MaximizeIcon(props: MaximizeIconProps, ref) {
    return (
      <Icon
        data-testid="MaximizeIcon"
        aria-label="maximize"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 0h12v12H0V0zm11 3H1v8h10V3z" />
      </Icon>
    );
  }
);
