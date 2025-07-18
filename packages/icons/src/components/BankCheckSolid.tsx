// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type BankCheckSolidIconProps = IconProps;

export const BankCheckSolidIcon = forwardRef<
  SVGSVGElement,
  BankCheckSolidIconProps
>(function BankCheckSolidIcon(props: BankCheckSolidIconProps, ref) {
  return (
    <Icon
      data-testid="BankCheckSolidIcon"
      aria-label="bank check solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M0 2h12v2H0z" />
      <path
        fillRule="evenodd"
        d="M0 5h12v5H0zm2 3h7v1H2zm4-2H2v1h4zm4 0H8v1h2z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
