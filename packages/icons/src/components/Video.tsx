import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type VideoIconProps = IconProps;

export const VideoIcon = forwardRef<SVGSVGElement, VideoIconProps>(
  function VideoIcon(props: VideoIconProps, ref) {
    return (
      <Icon
        data-testid="VideoIcon"
        aria-label="video"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M9 8.07V10H0V2h9v1.942L12 3v6l-3-.93ZM1 3h7v6H1V3Zm8 4.022 2 .62v-3.28L9 4.99v2.032Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
