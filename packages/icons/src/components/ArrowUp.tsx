import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ArrowUpIconProps = IconProps;

export const ArrowUpIcon = forwardRef<SVGSVGElement, ArrowUpIconProps>(
  function ArrowUpIcon(props: ArrowUpIconProps, ref) {
    return (
      <Icon
        data-testid="ArrowUpIcon"
        aria-label="arrow up"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 4v8h2V4h3L6 0 2 4h3Z" />
      </Icon>
    );
  }
);
