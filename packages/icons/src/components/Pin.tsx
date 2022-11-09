import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PinIconProps = IconProps;

export const PinIcon = forwardRef<SVGSVGElement, PinIconProps>(function PinIcon(
  props: PinIconProps,
  ref
) {
  return (
    <Icon
      data-testid="PinIcon"
      aria-label="pin"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M11.923 4 8.034.134v1.354L4.615 4.907H1.494l2.298 2.298-3.005 3.359-.707 1.414 1.414-.707 3.359-3.005 2.237 2.237V7.382L10.501 4h1.423zM5.028 5.907 8.71 2.225l1.061 1.061-3.682 3.682v1.121L3.907 5.907h1.121z" />
    </Icon>
  );
});
