import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CreditCardSolidIconProps = IconProps;

export const CreditCardSolidIcon = forwardRef<
  SVGSVGElement,
  CreditCardSolidIconProps
>(function CreditCardSolidIcon(props: CreditCardSolidIconProps, ref) {
  return (
    <Icon
      data-testid="CreditCardSolidIcon"
      aria-label="credit card solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M0 4V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1H0z" />
        <path d="M0 5v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5H0zm1 3h3v1H1V8zm9-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
      </>
    </Icon>
  );
});
