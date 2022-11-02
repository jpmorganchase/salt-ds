import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PivotSolidIconProps = IconProps;

export const PivotSolidIcon = forwardRef<SVGSVGElement, PivotSolidIconProps>(
  function PivotSolidIcon(props: PivotSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PivotSolidIcon"
        aria-label="pivot solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 0H0v12h12V0ZM1 8.5 4 11V9h5V4h2L8.5 1 6 4h2v4H4V6L1 8.5Z"
        />
      </Icon>
    );
  }
);
