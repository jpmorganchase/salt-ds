import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type OverflowMenuIconProps = IconProps;

export const OverflowMenuIcon = forwardRef<
  SVGSVGElement,
  OverflowMenuIconProps
>(function OverflowMenuIcon(props: OverflowMenuIconProps, ref) {
  return (
    <Icon
      data-testid="OverflowMenuIcon"
      aria-label="overflow menu"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M1 5h2v2H1V5zm4 0h2v2H5V5zm6 0H9v2h2V5z" />
    </Icon>
  );
});
