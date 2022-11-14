import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GuideClosedIconProps = IconProps;

export const GuideClosedIcon = forwardRef<SVGSVGElement, GuideClosedIconProps>(
  function GuideClosedIcon(props: GuideClosedIconProps, ref) {
    return (
      <Icon
        data-testid="GuideClosedIcon"
        aria-label="guide closed"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M9 4H6v1h3V4zm0 2H6v1h3V6z" />
        <path d="M11 12V1H1.875v2H1v1h.875v1H1v1h.875v1H1v1h.875v1H1v1h.875v2H11zM3 2h1v9H3V2zm2 9V2h5v9H5z" />
      </Icon>
    );
  }
);
