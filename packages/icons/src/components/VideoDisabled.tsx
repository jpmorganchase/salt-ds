import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VideoDisabledIconProps = IconProps;

export const VideoDisabledIcon = forwardRef<
  SVGSVGElement,
  VideoDisabledIconProps
>(function VideoDisabledIcon(props: VideoDisabledIconProps, ref) {
  return (
    <Icon
      data-testid="VideoDisabledIcon"
      aria-label="video disabled"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M0 3.129V10h6.889L5.886 9H1V4.126l-1-.997Z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 6.858V3H4.135L3.133 2H9v1.942L12 3v6l-2.69-.834L8 6.858Zm3 .785-2-.62V4.99l2-.628v3.28Z"
        />
        <path d="M9.307 11 0 1.716.716 1 10 10.267 9.307 11Z" />
      </>
    </Icon>
  );
});
