// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SuccessSolidIconProps = IconProps;

/** @deprecated - Use `CheckmarkSolidIcon` instead. */
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
        d="M12 0H0v12h12zM9.858 1.846 3.672 8.033l-1.93-1.93-1.06 1.06 2.99 2.991 7.247-7.247z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
