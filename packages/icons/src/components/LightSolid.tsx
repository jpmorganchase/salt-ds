import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LightSolidIconProps = IconProps;

export const LightSolidIcon = forwardRef<SVGSVGElement, LightSolidIconProps>(
  function LightSolidIcon(props: LightSolidIconProps, ref) {
    return (
      <Icon
        data-testid="LightSolidIcon"
        aria-label="light solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path d="M0 5.5h2v1H0v-1Z" />
          <path d="m2.11 1.404 1.415 1.414-.707.707-1.414-1.414.707-.707Z" />
          <path d="m1.404 9.89 1.414-1.415.707.707-1.414 1.414-.707-.707Z" />
          <path d="M5.5 12v-2h1v2h-1Z" />
          <path d="M10 5.5h2v1h-2v-1Z" />
          <path d="m9.182 8.475 1.414 1.414-.707.707-1.414-1.414.707-.707Z" />
          <path d="m8.475 2.818 1.414-1.414.707.707-1.414 1.414-.707-.707Z" />
          <path d="M5.5 2V0h1v2h-1Z" />
        </>
      </Icon>
    );
  }
);
