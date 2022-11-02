import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SuccessIconProps = IconProps;

export const SuccessIcon = forwardRef<SVGSVGElement, SuccessIconProps>(
  function SuccessIcon(props: SuccessIconProps, ref) {
    return (
      <Icon
        data-testid="SuccessIcon"
        aria-label="success"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m11.8 2.26-7.463 8.052-4.1-3.831 1.025-1.096 3 2.803L10.7 1.24l1.1 1.02Z"
        />
      </Icon>
    );
  }
);
