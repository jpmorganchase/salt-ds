// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type ApiIconProps = IconProps;

export const ApiIcon = forwardRef<SVGSVGElement, ApiIconProps>(function ApiIcon(
  props: ApiIconProps,
  ref,
) {
  return (
    <Icon
      data-testid="ApiIcon"
      aria-label="api"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 5.99 3 3l.707.705-2.293 2.284 2.293 2.296L3 8.99zm12 .022L9 9l-.708-.704 2.294-2.284-2.294-2.296.707-.704zM6.95 3.011 4.002 8.544l.895.446 2.948-5.533z" />
    </Icon>
  );
});
