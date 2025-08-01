// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type CompassSolidIconProps = IconProps;

export const CompassSolidIcon = forwardRef<
  SVGSVGElement,
  CompassSolidIconProps
>(function CompassSolidIcon(props: CompassSolidIconProps, ref) {
  return (
    <Icon
      data-testid="CompassSolidIcon"
      aria-label="compass solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="m5.376 5.376 1.871-.623-.623 1.87-1.871.624z" />
      <path
        fillRule="evenodd"
        d="M12 6A6 6 0 1 1 0 6a6 6 0 0 1 12 0M4.586 4.586l4.242-1.414-1.414 4.242-4.242 1.414z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
