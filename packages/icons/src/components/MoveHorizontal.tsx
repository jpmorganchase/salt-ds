import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type MoveHorizontalIconProps = IconProps;

export const MoveHorizontalIcon = forwardRef<
  SVGSVGElement,
  MoveHorizontalIconProps
>(function MoveHorizontalIcon(props: MoveHorizontalIconProps, ref) {
  return (
    <Icon
      data-testid="MoveHorizontalIcon"
      aria-label="move horizontal"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M5 5.25H3V3L0 6l3 3V6.75h2v-1.5zm2 0h2V3l3 3-3 3V6.75H7v-1.5z" />
    </Icon>
  );
});
