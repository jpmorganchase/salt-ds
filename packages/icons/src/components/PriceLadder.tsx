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
        <path d="M3 2h6V0h1v12H9V9H3v3H2V0h1v2zm6 3V3H3v2h6zM3 6v2h6V6H3z" />
      </Icon>
    );
  }
);
