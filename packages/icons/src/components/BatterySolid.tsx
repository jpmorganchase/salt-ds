// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BatterySolidIconProps = IconProps;

export const BatterySolidIcon = forwardRef<
  SVGSVGElement,
  BatterySolidIconProps
>(function BatterySolidIcon(props: BatterySolidIconProps, ref) {
  return (
    <Icon
      data-testid="BatterySolidIcon"
      aria-label="battery solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M8 0H4v1H3v11h6V1H8V0ZM4 2v1h4V2H4Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
