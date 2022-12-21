import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DoubleChevronUpIconProps = IconProps;

export const DoubleChevronUpIcon = forwardRef<
  SVGSVGElement,
  DoubleChevronUpIconProps
>(function DoubleChevronUpIcon(props: DoubleChevronUpIconProps, ref) {
  return (
    <Icon
      data-testid="DoubleChevronUpIcon"
      aria-label="double chevron up"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M1.599 11.5 6 7.192l4.401 4.308 1.099-.992L6 5 .5 10.508l1.099.992Z" />
      <path d="M1.599 7 6 2.692 10.401 7l1.099-.992L6 .5.5 6.008 1.599 7Z" />
    </Icon>
  );
});
