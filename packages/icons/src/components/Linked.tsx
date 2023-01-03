import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LinkedIconProps = IconProps;

export const LinkedIcon = forwardRef<SVGSVGElement, LinkedIconProps>(
  function LinkedIcon(props: LinkedIconProps, ref) {
    return (
      <Icon
        data-testid="LinkedIcon"
        aria-label="linked"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8.475 1.371a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1 0 1.415L7.414 6.675a1 1 0 0 1-1.414 0l-.354-.354-.707.707.354.354a2 2 0 0 0 2.828 0L11.303 4.2a2 2 0 0 0 0-2.829l-.707-.707a2 2 0 0 0-2.828 0L6 2.432l.707.707 1.768-1.768Z" />
        <path d="M3.525 10.564a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 0 1 0-1.415L4.586 5.26A1 1 0 0 1 6 5.26l.354.354.707-.707-.354-.354a2 2 0 0 0-2.828 0L.697 7.735a2 2 0 0 0 0 2.829l.707.707a2 2 0 0 0 2.828 0L6 9.503l-.707-.707-1.768 1.768Z" />
      </Icon>
    );
  }
);
