import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DoubleChevronDownIconProps = IconProps;

export const DoubleChevronDownIcon = forwardRef<
  SVGSVGElement,
  DoubleChevronDownIconProps
>(function DoubleChevronDownIcon(props: DoubleChevronDownIconProps, ref) {
  return (
    <Icon
      data-testid="DoubleChevronDownIcon"
      aria-label="double chevron down"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M10.401.5 6 4.808 1.599.5.5 1.492 6 7l5.5-5.508L10.401.5z" />
      <path d="M10.401 5 6 9.308 1.599 5 .5 5.992 6 11.5l5.5-5.508L10.401 5z" />
    </Icon>
  );
});
