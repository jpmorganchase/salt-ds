import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PauseIconProps = IconProps;

export const PauseIcon = forwardRef<SVGSVGElement, PauseIconProps>(
  function PauseIcon(props: PauseIconProps, ref) {
    return (
      <Icon
        data-testid="PauseIcon"
        aria-label="pause"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2 0h3.003v12H2V0Zm.997 1v10h.997V1h-.997Zm4-1H10v12H6.997V0Zm1.009 1v10h.997V1h-.997Z" />
      </Icon>
    );
  }
);
