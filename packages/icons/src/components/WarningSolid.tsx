import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type WarningSolidIconProps = IconProps;

export const WarningSolidIcon = forwardRef<
  SVGSVGElement,
  WarningSolidIconProps
>(function WarningSolidIcon(props: WarningSolidIconProps, ref) {
  return (
    <Icon
      data-testid="WarningSolidIcon"
      aria-label="warning solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="m6 0 6 12H0L6 0ZM5 4.5h2V8H5V4.5Zm2 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
