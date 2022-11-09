import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PivotIconProps = IconProps;

export const PivotIcon = forwardRef<SVGSVGElement, PivotIconProps>(
  function PivotIcon(props: PivotIconProps, ref) {
    return (
      <Icon
        data-testid="PivotIcon"
        aria-label="pivot"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 0v12H0V0h12zM1 11h3L1 8.5V11zm3-2v2h7V1H1v7.5L4 6v2h4V4H6l2.5-3L11 4H9v5H4z" />
      </Icon>
    );
  }
);
