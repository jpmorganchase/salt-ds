import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ArrowLeftIconProps = IconProps;

export const ArrowLeftIcon = forwardRef<SVGSVGElement, ArrowLeftIconProps>(
  function ArrowLeftIcon(props: ArrowLeftIconProps, ref) {
    return (
      <Icon
        data-testid="ArrowLeftIcon"
        aria-label="arrow left"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 7h8V5H4V2L0 6l4 4V7z" />
      </Icon>
    );
  }
);
