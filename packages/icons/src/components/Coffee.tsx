import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CoffeeIconProps = IconProps;

export const CoffeeIcon = forwardRef<SVGSVGElement, CoffeeIconProps>(
  function CoffeeIcon(props: CoffeeIconProps, ref) {
    return (
      <Icon
        data-testid="CoffeeIcon"
        aria-label="coffee"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1 10h8v1H1v-1Z" />
        <path
          fillRule="evenodd"
          d="M10 3H9v2h1a1 1 0 1 0 0-2ZM8 2v4h2a2 2 0 1 0 0-4H8Z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M8 2H2v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2Zm1-1v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V1h8Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
