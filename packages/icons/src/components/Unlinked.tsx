import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UnlinkedIconProps = IconProps;

export const UnlinkedIcon = forwardRef<SVGSVGElement, UnlinkedIconProps>(
  function UnlinkedIcon(props: UnlinkedIconProps, ref) {
    return (
      <Icon
        data-testid="UnlinkedIcon"
        aria-label="unlinked"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 0v2.5H3V0h1zm4.443 1.371a1 1 0 0 1 1.414 0l.707.707a.999.999 0 0 1 0 1.414L7.028 7.028l.707.707 3.536-3.536a2 2 0 0 0 0-2.828l-.707-.707a2 2 0 0 0-2.828 0L5.968 2.432l.707.707 1.768-1.768zm-4.951 9.193a1 1 0 0 1-1.414 0l-.707-.707a.999.999 0 0 1 0-1.414l3.536-3.536L4.2 4.2.664 7.736a2 2 0 0 0 0 2.828l.707.707a1.999 1.999 0 0 0 2.828 0l1.768-1.768-.707-.707-1.768 1.768zM9.5 8H12v1H9.5V8zm-7-5H0v1h2.5V3zM9 12V9.5H8V12h1z" />
      </Icon>
    );
  }
);
