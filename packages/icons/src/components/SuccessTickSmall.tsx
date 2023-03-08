import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SuccessTickSmallIconProps = IconProps;

export const SuccessTickSmallIcon = forwardRef<
  SVGSVGElement,
  SuccessTickSmallIconProps
>(function SuccessTickSmallIcon(props: SuccessTickSmallIconProps, ref) {
  return (
    <Icon
      data-testid="SuccessTickSmallIcon"
      aria-label="success small"
      viewBox="0 0 8 8"
      ref={ref}
      {...props}
    >
      <path d="M7.99656 1.30278L2.86481 7.20967L0.0119629 4.67379L0.67633 3.92638L2.77323 5.79031L7.24166 0.646942L7.99656 1.30278Z" />
    </Icon>
  );
});
