import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ArrowRightIconProps = IconProps;

export const ArrowRightIcon = forwardRef<SVGSVGElement, ArrowRightIconProps>(
  function ArrowRightIcon(props: ArrowRightIconProps, ref) {
    return (
      <Icon
        data-testid="ArrowRightIcon"
        aria-label="arrow right"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8 5H0v2h8v3l4-4-4-4v3Z" />
      </Icon>
    );
  }
);
