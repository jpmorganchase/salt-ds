import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

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
      <path d="M0 2h12v2H0V2zm0 3v5h12V5H0zm2 3h7v1H2V8zm4-2v1H2V6h4zm4 0v1H8V6h2z" />
    </Icon>
  );
});
