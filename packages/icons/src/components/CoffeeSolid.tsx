import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CoffeeSolidIconProps = IconProps;

export const CoffeeSolidIcon = forwardRef<SVGSVGElement, CoffeeSolidIconProps>(
  function CoffeeSolidIcon(props: CoffeeSolidIconProps, ref) {
    return (
      <Icon
        data-testid="CoffeeSolidIcon"
        aria-label="coffee solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M9 1H1v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6h1a2 2 0 1 0 0-4H9V1Zm1 4H9V3h1a1 1 0 1 1 0 2ZM7.857 2H2.143v2h5.714V2Z"
          clipRule="evenodd"
        />
        <path d="M9 10H1v1h8v-1Z" />
      </Icon>
    );
  }
);
