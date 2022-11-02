import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MoveVerticalIconProps = IconProps;

export const MoveVerticalIcon = forwardRef<
  SVGSVGElement,
  MoveVerticalIconProps
>(function MoveVerticalIcon(props: MoveVerticalIconProps, ref) {
  return (
    <Icon
      data-testid="MoveVerticalIcon"
      aria-label="move vertical"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M5.25 7v2H3l3 3 3-3H6.75V7h-1.5z" />
        <path d="M5.25 5V3H3l3-3 3 3H6.75v2h-1.5z" />
      </>
    </Icon>
  );
});
