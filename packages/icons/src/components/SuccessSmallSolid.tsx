// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type SuccessSmallSolidIconProps = IconProps;

/** @deprecated - Use `CheckmarkSolidIcon` instead. */
export const SuccessSmallSolidIcon = forwardRef<
  SVGSVGElement,
  SuccessSmallSolidIconProps
>(function SuccessSmallSolidIcon(props: SuccessSmallSolidIconProps, ref) {
  return (
    <Icon
      data-testid="SuccessSmallSolidIcon"
      aria-label="success small solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 0H0v12h12zM9.535 2.465 3.88 8.12 2.465 6.707l-.707.707 2.12 2.121 6.365-6.363z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
