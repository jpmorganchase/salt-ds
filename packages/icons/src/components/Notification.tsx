import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type NotificationIconProps = IconProps;

export const NotificationIcon = forwardRef<
  SVGSVGElement,
  NotificationIconProps
>(function NotificationIcon(props: NotificationIconProps, ref) {
  return (
    <Icon
      data-testid="NotificationIcon"
      aria-label="notification"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M2.004 6V3c0-.414.078-.8.234-1.16.157-.367.367-.684.633-.95.274-.273.594-.492.961-.656A2.962 2.962 0 0 1 5.004 0h1.992c.414 0 .805.078 1.172.234.367.164.684.383.95.657.273.265.487.582.644.949.156.36.234.746.234 1.16v3c.102.57.234 1.023.399 1.36.171.335.375.55.609.644H12V9H0v-.996h.996c.234-.094.434-.309.598-.645.172-.336.308-.789.41-1.359Zm7.605 2.004a3.656 3.656 0 0 1-.351-.809 9.323 9.323 0 0 1-.246-1.02L9 6V3c0-.547-.195-1.016-.586-1.406a1.931 1.931 0 0 0-1.418-.586H5.004a1.93 1.93 0 0 0-1.418.586C3.196 1.984 3 2.454 3 3v3l-.012.176c-.07.375-.152.715-.246 1.02-.094.304-.21.574-.351.808h7.218ZM6 12a1.52 1.52 0 0 1-1.066-.41 1.27 1.27 0 0 1-.434-.973v-.609h3v.609c0 .383-.148.707-.445.973-.29.273-.64.41-1.055.41Z" />
    </Icon>
  );
});
