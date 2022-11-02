import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SuccessSolidIconProps = IconProps;

export const SuccessSolidIcon = forwardRef<
  SVGSVGElement,
  SuccessSolidIconProps
>(function SuccessSolidIcon(props: SuccessSolidIconProps, ref) {
  return (
    <Icon
      data-testid="SuccessSolidIcon"
      aria-label="success solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m11.8 2.26-7.463 8.052-4.1-3.831 1.025-1.096 3 2.803L10.7 1.24l1.1 1.02Z"
      />
    </Icon>
  );
});
