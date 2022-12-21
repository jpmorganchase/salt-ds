import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PriceLadderIconProps = IconProps;

export const PriceLadderIcon = forwardRef<SVGSVGElement, PriceLadderIconProps>(
  function PriceLadderIcon(props: PriceLadderIconProps, ref) {
    return (
      <Icon
        data-testid="PriceLadderIcon"
        aria-label="price ladder"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M3 2V0H2v12h1V9h6v3h1V0H9v2H3Zm6 3V3H3v2h6ZM3 6v2h6V6H3Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
