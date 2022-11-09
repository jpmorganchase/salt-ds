import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BankCheckIconProps = IconProps;

export const BankCheckIcon = forwardRef<SVGSVGElement, BankCheckIconProps>(
  function BankCheckIcon(props: BankCheckIconProps, ref) {
    return (
      <Icon
        data-testid="BankCheckIcon"
        aria-label="bank check"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 2v8H0V2h12zm-1 2H1v5h10V4z" />
        <path d="M2 7h7v1H2V7zm0-2h4v1H2V5zm6 0h2v1H8V5z" />
      </Icon>
    );
  }
);
