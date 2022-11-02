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
        <>
          <path d="M0 1h12v2H0V1z" />
          <path d="M0 5h12v2H0V5z" />
          <path d="M12 9H0v2h12V9z" />
        </>
      </Icon>
    );
  }
);
