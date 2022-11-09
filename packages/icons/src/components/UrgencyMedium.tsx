import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UrgencyMediumIconProps = IconProps;

export const UrgencyMediumIcon = forwardRef<
  SVGSVGElement,
  UrgencyMediumIconProps
>(function UrgencyMediumIcon(props: UrgencyMediumIconProps, ref) {
  return (
    <Icon
      data-testid="UrgencyMediumIcon"
      aria-label="urgency medium"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M11.3 6.184 6 2.5.7 6.184 1.275 7 6 3.715 10.725 7l.575-.816Z" />
      <path d="M11.3 8.684 6 5 .7 8.684l.575.816L6 6.215 10.725 9.5l.575-.816Z" />
    </Icon>
  );
});
