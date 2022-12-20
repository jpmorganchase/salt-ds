import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type KeyCommandIconProps = IconProps;

export const KeyCommandIcon = forwardRef<SVGSVGElement, KeyCommandIconProps>(
  function KeyCommandIcon(props: KeyCommandIconProps, ref) {
    return (
      <Icon
        data-testid="KeyCommandIcon"
        aria-label="key command"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M9 7H8V5h1a2 2 0 1 0-2-2v1H5V3a2 2 0 1 0-2 2h1v2H3a2 2 0 1 0 2 2V8h2v1a2 2 0 1 0 2-2Zm0-5a1 1 0 0 1 0 2H8V3a1 1 0 0 1 1-1ZM2 3a1 1 0 0 1 2 0v1H3a1 1 0 0 1-1-1Zm1 7a1 1 0 0 1 0-2h1v1a1 1 0 0 1-1 1Zm2-3V5h2v2H5Zm4 3a1 1 0 0 1-1-1V8h1a1 1 0 0 1 0 2Z" />
      </Icon>
    );
  }
);
