import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type DoubleChevronRightIconProps = IconProps;

export const DoubleChevronRightIcon = forwardRef<
  SVGSVGElement,
  DoubleChevronRightIconProps
>(function DoubleChevronRightIcon(props: DoubleChevronRightIconProps, ref) {
  return (
    <Icon
      data-testid="DoubleChevronRightIcon"
      aria-label="double chevron right"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M.5 1.599 4.808 6 .5 10.401l.992 1.099L7 6 1.492.5.5 1.599z" />
      <path d="M5 1.599 9.308 6 5 10.401l.992 1.099L11.5 6 5.992.5 5 1.599z" />
    </Icon>
  );
});
