import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type NotificationSolidIconProps = IconProps;

export const NotificationSolidIcon = forwardRef<
  SVGSVGElement,
  NotificationSolidIconProps
>(function NotificationSolidIcon(props: NotificationSolidIconProps, ref) {
  return (
    <Icon
      data-testid="NotificationSolidIcon"
      aria-label="notification solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M.996 8.004c.234-.094.434-.309.598-.645.172-.336.308-.789.41-1.359V3c0-.414.078-.8.234-1.16.157-.367.367-.684.633-.95.274-.273.594-.492.961-.656A2.962 2.962 0 0 1 5.004 0h1.992c.414 0 .805.078 1.172.234.367.164.684.383.95.657.273.265.487.582.644.949.156.36.234.746.234 1.16v3.012l.047.21c.102.508.23.91.387 1.208.164.289.355.48.574.574H12V9H0v-.996h.996ZM6 12a1.52 1.52 0 0 1-1.066-.41 1.27 1.27 0 0 1-.434-.973v-.609h3v.609c0 .383-.148.707-.445.973-.29.273-.64.41-1.055.41Z" />
    </Icon>
  );
});
