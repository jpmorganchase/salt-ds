import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PauseSolidIconProps = IconProps;

export const PauseSolidIcon = forwardRef<SVGSVGElement, PauseSolidIconProps>(
  function PauseSolidIcon(props: PauseSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PauseSolidIcon"
        aria-label="pause solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 0h3.003v12H2V0Zm4.997 0H10v12H6.997V0Z" />
      </Icon>
    );
  }
);
