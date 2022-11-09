import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DoubleChevronLeftIconProps = IconProps;

export const DoubleChevronLeftIcon = forwardRef<
  SVGSVGElement,
  DoubleChevronLeftIconProps
>(function DoubleChevronLeftIcon(props: DoubleChevronLeftIconProps, ref) {
  return (
    <Icon
      data-testid="DoubleChevronLeftIcon"
      aria-label="double chevron left"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M11.5 10.401 7.192 6 11.5 1.599 10.508.5 5 6l5.508 5.5.992-1.099z" />
      <path d="M7 10.401 2.692 6 7 1.599 6.008.5.5 6l5.508 5.5L7 10.401z" />
    </Icon>
  );
});
