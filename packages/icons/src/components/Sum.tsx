import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SumIconProps = IconProps;

export const SumIcon = forwardRef<SVGSVGElement, SumIconProps>(function SumIcon(
  props: SumIconProps,
  ref
) {
  return (
    <Icon
      data-testid="SumIcon"
      aria-label="sum"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M8 6 6 9h3V7.5h3V12H0l4.125-6L0 0h12v4.625H9V3H6l2 3zm2 2.5V10H4.131l2.667-4-2.667-4H10v1.625h1V1H1.901l3.437 5-3.437 5H11V8.5h-1z" />
    </Icon>
  );
});
