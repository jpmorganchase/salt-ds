import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PrintSolidIconProps = IconProps;

export const PrintSolidIcon = forwardRef<SVGSVGElement, PrintSolidIconProps>(
  function PrintSolidIcon(props: PrintSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PrintSolidIcon"
        aria-label="print solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 0h8v2h2v6h-2v4H2V8H0V2h2V0zm7 2V1H3v1h6zm1 3H2v2h1V6h6v1h1V5zm-2 5V9H4v1h4zm0-3H4v1h4V7z" />
      </Icon>
    );
  }
);
