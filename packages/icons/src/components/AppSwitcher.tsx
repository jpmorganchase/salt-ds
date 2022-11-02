import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type AppSwitcherIconProps = IconProps;

export const AppSwitcherIcon = forwardRef<SVGSVGElement, AppSwitcherIconProps>(
  function AppSwitcherIcon(props: AppSwitcherIconProps, ref) {
    return (
      <Icon
        data-testid="AppSwitcherIcon"
        aria-label="app switcher"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M3 0H0v3h3V0z" />
          <path d="M7.5 0h-3v3h3V0z" />
          <path d="M9 3V0h3v3H9z" />
          <path d="M9 4.5v3h3v-3H9z" />
          <path d="M9 12V9h3v3H9z" />
          <path d="M4.5 9v3h3V9h-3z" />
          <path d="M0 9h3v3H0V9z" />
          <path d="M3 4.5H0v3h3v-3z" />
          <path d="M4.5 4.5h3v3h-3v-3z" />
        </>
      </Icon>
    );
  }
);
