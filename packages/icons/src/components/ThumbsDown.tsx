import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ThumbsDownIconProps = IconProps;

export const ThumbsDownIcon = forwardRef<SVGSVGElement, ThumbsDownIconProps>(
  function ThumbsDownIcon(props: ThumbsDownIconProps, ref) {
    return (
      <Icon
        data-testid="ThumbsDownIcon"
        aria-label="thumbs down"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M10 0v7h2V0h-2zM7 8.764l1-2V1H2.618L1 4.236V6.5a.5.5 0 0 0 .5.5H6v3.5a.5.5 0 0 0 .5.5H7V8.764zM8 12H6.5A1.5 1.5 0 0 1 5 10.5V8H1.5A1.5 1.5 0 0 1 0 6.5V4l2-4h7v7L8 9v3z" />
      </Icon>
    );
  }
);
