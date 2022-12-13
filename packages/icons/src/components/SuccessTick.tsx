import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SuccessTickIconProps = IconProps;

export const SuccessTickIcon = forwardRef<SVGSVGElement, SuccessTickIconProps>(
  function SuccessTickIcon(props: SuccessTickIconProps, ref) {
    return (
      <Icon
        data-testid="SuccessTickIcon"
        aria-label="success tick"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m11.8 2.26-7.463 8.052-4.1-3.832 1.024-1.096L4.26 8.187l6.439-6.948 1.1 1.02z" />
      </Icon>
    );
  }
);
