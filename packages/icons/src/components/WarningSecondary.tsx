import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type WarningSecondaryIconProps = IconProps;

export const WarningSecondaryIcon = forwardRef<
  SVGSVGElement,
  WarningSecondaryIconProps
>(function WarningSecondaryIcon(props: WarningSecondaryIconProps, ref) {
  return (
    <Icon
      data-testid="WarningSecondaryIcon"
      aria-label="warning secondary"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M5 8V4.5h2V8H5z" />
      <path d="M7 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
      <path d="M6 0 0 12h12L6 0zM1.618 11 6 2.236 10.382 11H1.618z" />
    </Icon>
  );
});
