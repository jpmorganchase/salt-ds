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
        <path d="M9 4H6v1h3V4Zm0 2H6v1h3V6Z" />
        <path
          fillRule="evenodd"
          d="M11 12V1H2v2H1v1h1v1H1v1h1v1H1v1h1v1H1v1h1v2h9ZM3 2h1v9H3V2Zm2 9V2h5v9H5Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
