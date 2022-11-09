import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type HomeSolidIconProps = IconProps;

export const HomeSolidIcon = forwardRef<SVGSVGElement, HomeSolidIconProps>(
  function HomeSolidIcon(props: HomeSolidIconProps, ref) {
    return (
      <Icon
        data-testid="HomeSolidIcon"
        aria-label="home solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 4.875 6 0l6 4.875L11 6l-1-.825V12H7V9H5v3H2V5.095L.875 6 0 4.875z" />
      </Icon>
    );
  }
);
