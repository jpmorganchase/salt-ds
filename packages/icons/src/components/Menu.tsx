import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MenuIconProps = IconProps;

export const MenuIcon = forwardRef<SVGSVGElement, MenuIconProps>(
  function MenuIcon(props: MenuIconProps, ref) {
    return (
      <Icon
        data-testid="MenuIcon"
        aria-label="menu"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 1h12v2H0V1zm0 4h12v2H0V5zm12 4H0v2h12V9z" />
      </Icon>
    );
  }
);
