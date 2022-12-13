import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VideoSolidIconProps = IconProps;

export const VideoSolidIcon = forwardRef<SVGSVGElement, VideoSolidIconProps>(
  function VideoSolidIcon(props: VideoSolidIconProps, ref) {
    return (
      <Icon
        data-testid="VideoSolidIcon"
        aria-label="video solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M9 2H0v8h9V8.07L12 9V3l-3 .942V2Z" />
      </Icon>
    );
  }
);
