import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CookieSolidIconProps = IconProps;

export const CookieSolidIcon = forwardRef<SVGSVGElement, CookieSolidIconProps>(
  function CookieSolidIcon(props: CookieSolidIconProps, ref) {
    return (
      <Icon
        data-testid="CookieSolidIcon"
        aria-label="cookie solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 0a6 6 0 1 0 5.917 6.998A2 2 0 0 1 10 5a3 3 0 0 1-2.989-3.261A2 2 0 0 1 6 0ZM4 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm3 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-2 .5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM4.5 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"
          />
          <path d="M9 1.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          <path d="M11 3.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
          <path d="M12 .5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z" />
        </>
      </Icon>
    );
  }
);
