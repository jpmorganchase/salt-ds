import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SumSolidIconProps = IconProps;

export const SumSolidIcon = forwardRef<SVGSVGElement, SumSolidIconProps>(
  function SumSolidIcon(props: SumSolidIconProps, ref) {
    return (
      <Icon
        data-testid="SumSolidIcon"
        aria-label="sum solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m6 9 2-3-2-3h3v1.625h3V0H0l4.125 6L0 12h12V7.5H9V9H6Z" />
      </Icon>
    );
  }
);
