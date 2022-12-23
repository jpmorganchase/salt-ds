import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RedoIconProps = IconProps;

export const RedoIcon = forwardRef<SVGSVGElement, RedoIconProps>(
  function RedoIcon(props: RedoIconProps, ref) {
    return (
      <Icon
        data-testid="RedoIcon"
        aria-label="redo"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4.063 1a4 4 0 0 0 0 8H8v2l4-2.5L8 6v2H4.063a3 3 0 0 1 0-6H12V1H4.063Z" />
      </Icon>
    );
  }
);
