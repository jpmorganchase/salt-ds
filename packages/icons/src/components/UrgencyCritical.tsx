import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type UrgencyCriticalIconProps = IconProps;

export const UrgencyCriticalIcon = forwardRef<
  SVGSVGElement,
  UrgencyCriticalIconProps
>(function UrgencyCriticalIcon(props: UrgencyCriticalIconProps, ref) {
  return (
    <Icon
      data-testid="UrgencyCriticalIcon"
      aria-label="urgency critical"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="m6 1 5.3 3.684v3.729L6 4.715.7 8.404v-3.72L6 1Z" />
        <path d="M11.3 9.684 6 6 .7 9.684l.575.816L6 7.215l4.725 3.285.575-.816Z" />
      </>
    </Icon>
  );
});
