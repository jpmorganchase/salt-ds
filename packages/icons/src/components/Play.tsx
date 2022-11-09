import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PlayIconProps = IconProps;

export const PlayIcon = forwardRef<SVGSVGElement, PlayIconProps>(
  function PlayIcon(props: PlayIconProps, ref) {
    return (
      <Icon
        data-testid="PlayIcon"
        aria-label="play"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1 12V0l11 6-11 6zM2 1.685v8.631l7.912-4.315L2 1.686z" />
      </Icon>
    );
  }
);
