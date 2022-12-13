import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UnlockedSolidIconProps = IconProps;

export const UnlockedSolidIcon = forwardRef<
  SVGSVGElement,
  UnlockedSolidIconProps
>(function UnlockedSolidIcon(props: UnlockedSolidIconProps, ref) {
  return (
    <Icon
      data-testid="UnlockedSolidIcon"
      aria-label="unlocked solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M4 1a1 1 0 0 0-1 1v2h9v8H0V4h2V2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2H9a1 1 0 0 0-1-1H4zm2.5 7.915a1.5 1.5 0 1 0-1 0V10h1V8.915z" />
    </Icon>
  );
});
