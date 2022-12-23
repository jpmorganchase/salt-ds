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
      <path
        fillRule="evenodd"
        d="M8 6 6 3h3v1.625h3V0H0l4.125 6L0 12h12V7.5H9V9H6l2-3Zm2 2.5V10H4.131l2.667-4-2.667-4H10v1.625h1V1H1.901l3.438 5L1.9 11H11V8.5h-1Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
