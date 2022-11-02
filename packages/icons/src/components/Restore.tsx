import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RestoreIconProps = IconProps;

export const RestoreIcon = forwardRef<SVGSVGElement, RestoreIconProps>(
  function RestoreIcon(props: RestoreIconProps, ref) {
    return (
      <Icon
        data-testid="RestoreIcon"
        aria-label="restore"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M12 0H0v6h1V3h10v8H6v1h6V0z" />
          <path d="m4.45 6.5 1.061 1.061-2.975 2.975L4 12.001H0v-4l1.475 1.475L4.45 6.501z" />
        </>
      </Icon>
    );
  }
);
