import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SwapIconProps = IconProps;

export const SwapIcon = forwardRef<SVGSVGElement, SwapIconProps>(
  function SwapIcon(props: SwapIconProps, ref) {
    return (
      <Icon
        data-testid="SwapIcon"
        aria-label="swap"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M1 2h7V0l4 3-4 3V4H1V2z" />
          <path d="M11 8H4V6L0 9l4 3v-2h7V8z" />
        </>
      </Icon>
    );
  }
);
