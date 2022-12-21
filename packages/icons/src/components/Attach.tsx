import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type AttachIconProps = IconProps;

export const AttachIcon = forwardRef<SVGSVGElement, AttachIconProps>(
  function AttachIcon(props: AttachIconProps, ref) {
    return (
      <Icon
        data-testid="AttachIcon"
        aria-label="attach"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M3 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7H9V2a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v8.25c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.5a.5.5 0 0 0-1 0V9H5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7.5A1.5 1.5 0 0 1 6.5 12h-2A1.5 1.5 0 0 1 3 10.5V2Z" />
      </Icon>
    );
  }
);
