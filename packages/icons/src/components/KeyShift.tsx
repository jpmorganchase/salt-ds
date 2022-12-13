import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyShiftIconProps = IconProps;

export const KeyShiftIcon = forwardRef<SVGSVGElement, KeyShiftIconProps>(
  function KeyShiftIcon(props: KeyShiftIconProps, ref) {
    return (
      <Icon
        data-testid="KeyShiftIcon"
        aria-label="key shift"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M11 7H9v4H3V7H1l5-7 5 7ZM9.057 6 6 1.72 2.943 6H4v4h4V6h1.057Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
