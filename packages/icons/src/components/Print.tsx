import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PrintIconProps = IconProps;

export const PrintIcon = forwardRef<SVGSVGElement, PrintIconProps>(
  function PrintIcon(props: PrintIconProps, ref) {
    return (
      <Icon
        data-testid="PrintIcon"
        aria-label="print"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8 9v1H4V9h4zm0-1V7H4v1h4z" />
        <path d="M2 0h8v2h2v6h-2v4H2V8H0V2h2V0zm9 3H1v4h1V5h8v2h1V3zM9 2V1H3v1h6zM3 6v5h6V6H3z" />
      </Icon>
    );
  }
);
