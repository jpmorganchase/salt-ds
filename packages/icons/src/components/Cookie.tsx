import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CookieIconProps = IconProps;

export const CookieIcon = forwardRef<SVGSVGElement, CookieIconProps>(
  function CookieIcon(props: CookieIconProps, ref) {
    return (
      <Icon
        data-testid="CookieIcon"
        aria-label="cookie"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M4 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          <path d="M8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          <path d="M4.5 10a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
          <path d="M5 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.001.083A6.002 6.002 0 0 0 6 12a6.003 6.003 0 0 0 5.917-5.002A1.996 1.996 0 0 1 10 5a3 3 0 0 1-2.989-3.261A2 2 0 0 1 6 0c-.34 0-.674.028-.999.083Zm.193.982a5.001 5.001 0 1 0 5.508 6.64A3.008 3.008 0 0 1 9.14 5.907a4.002 4.002 0 0 1-3.133-3.665 3.007 3.007 0 0 1-.813-1.177Z"
          />
          <path d="M8.5 2a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
          <path d="M11 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          <path d="M11.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" />
        </>
      </Icon>
    );
  }
);
