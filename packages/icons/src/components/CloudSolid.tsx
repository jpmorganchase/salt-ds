import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CloudSolidIconProps = IconProps;

export const CloudSolidIcon = forwardRef<SVGSVGElement, CloudSolidIconProps>(
  function CloudSolidIcon(props: CloudSolidIconProps, ref) {
    return (
      <Icon
        data-testid="CloudSolidIcon"
        aria-label="cloud solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 10a3 3 0 0 1-.487-5.96 4.002 4.002 0 0 1 7.369.99A2.5 2.5 0 0 1 9.5 10H3Z" />
      </Icon>
    );
  }
);
