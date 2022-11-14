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
      <path d="M2.004 6V3c0-.414.078-.801.234-1.16.156-.367.367-.684.633-.949.273-.273.594-.492.961-.656A2.966 2.966 0 0 1 5.004.001h1.992c.414 0 .805.078 1.172.234.367.164.684.383.949.656.273.266.488.582.645.949.156.359.234.746.234 1.16v3c.102.57.234 1.023.398 1.359.172.336.375.551.609.645h.996V9h-12v-.996h.996c.234-.094.434-.309.598-.645.172-.336.309-.789.41-1.359zm7.605 2.004c-.141-.234-.258-.504-.352-.809s-.176-.645-.246-1.02l-.012-.176v-3c0-.547-.195-1.016-.586-1.406s-.863-.586-1.418-.586H5.003c-.555 0-1.027.195-1.418.586s-.586.859-.586 1.406v3l-.012.176c-.07.375-.152.715-.246 1.02s-.211.574-.352.809h7.219zM6 12c-.414 0-.77-.137-1.066-.41a1.273 1.273 0 0 1-.434-.973v-.609h3v.61c0 .383-.148.707-.445.973-.289.274-.641.41-1.055.41z" />
    </Icon>
  );
});
