import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type InfoIconProps = IconProps;

export const InfoIcon = forwardRef<SVGSVGElement, InfoIconProps>(
  function InfoIcon(props: InfoIconProps, ref) {
    return (
      <Icon
        data-testid="InfoIcon"
        aria-label="info"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M5 2h2v2H5V2Zm0 3h2v5H5V5Z" />
        <path
          fillRule="evenodd"
          d="M0 12V0h12v12H0ZM1 1h10v10H1V1Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
