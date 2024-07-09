// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SuccessSmallIconProps = IconProps;

export const SuccessSmallIcon = forwardRef<
  SVGSVGElement,
  SuccessSmallIconProps
>(function SuccessSmallIcon(props: SuccessSmallIconProps, ref) {
  return (
    <Icon
      data-testid="SuccessSmallIcon"
      aria-label="success small"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="m3.879 8.121 5.656-5.656.707.707L3.88 9.535 1.758 7.414l.707-.707L3.879 8.12Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
