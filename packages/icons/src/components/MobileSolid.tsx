// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MobileSolidIconProps = IconProps;

export const MobileSolidIcon = forwardRef<SVGSVGElement, MobileSolidIconProps>(
  function MobileSolidIcon(props: MobileSolidIconProps, ref) {
    return (
      <Icon
        data-testid="MobileSolidIcon"
        aria-label="mobile solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M2 2v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Zm7 8V2H3v8h6Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
