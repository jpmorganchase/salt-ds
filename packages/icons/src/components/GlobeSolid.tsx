import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GlobeSolidIconProps = IconProps;

export const GlobeSolidIcon = forwardRef<SVGSVGElement, GlobeSolidIconProps>(
  function GlobeSolidIcon(props: GlobeSolidIconProps, ref) {
    return (
      <Icon
        data-testid="GlobeSolidIcon"
        aria-label="globe solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6.041 10.802C6.826 9.881 7.368 8.941 7.677 8H4.356c.325.942.883 1.882 1.686 2.802zM7.919 7a5.904 5.904 0 0 0-.031-2H4.095a5.94 5.94 0 0 0 .001 2h3.822zm-.305-3c-.329-.911-.876-1.819-1.655-2.709C5.197 2.181 4.666 3.09 4.352 4h3.262z" />
        <path d="M12 6A6 6 0 1 0 0 6a6 6 0 0 0 12 0zM3.01 6c0-.335.024-.668.072-1H1.099c.071-.348.177-.682.316-1h1.887c.288-.976.787-1.932 1.488-2.853a5.024 5.024 0 0 1 2.33-.021C7.845 2.052 8.364 3.015 8.669 4h1.915c.139.317.245.652.316 1H8.903a6.93 6.93 0 0 1 .027 2h1.971a4.976 4.976 0 0 1-.316 1H8.723c-.273.968-.752 1.917-1.428 2.831a5.025 5.025 0 0 1-2.502.022c-.7-.92-1.199-1.877-1.488-2.853H1.416A4.956 4.956 0 0 1 1.1 7h1.984a6.978 6.978 0 0 1-.074-1z" />
      </Icon>
    );
  }
);
