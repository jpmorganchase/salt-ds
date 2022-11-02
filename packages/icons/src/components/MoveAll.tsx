import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MoveAllIconProps = IconProps;

export const MoveAllIcon = forwardRef<SVGSVGElement, MoveAllIconProps>(
  function MoveAllIcon(props: MoveAllIconProps, ref) {
    return (
      <Icon
        data-testid="MoveAllIcon"
        aria-label="move all"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 6.75H7v-1.5h2V3l3 3-3 3V6.75z" />
          <path d="M9 3H6.75v2h-1.5V3H3l3-3 3 3z" />
          <path d="m9 9-3 3-3-3h2.25V7h1.5v2H9z" />
          <path d="M3 6.75h2v-1.5H3V3L0 6l3 3V6.75z" />
        </>
      </Icon>
    );
  }
);
