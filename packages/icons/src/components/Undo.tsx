import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UndoIconProps = IconProps;

export const UndoIcon = forwardRef<SVGSVGElement, UndoIconProps>(
  function UndoIcon(props: UndoIconProps, ref) {
    return (
      <Icon
        data-testid="UndoIcon"
        aria-label="undo"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M8 11a4 4 0 1 0 0-8H4.063V1l-4 2.5 4 2.5V4H8a3 3 0 1 1 0 6H.063v1H8Z" />
      </Icon>
    );
  }
);
