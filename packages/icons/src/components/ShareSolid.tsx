import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ShareSolidIconProps = IconProps;

export const ShareSolidIcon = forwardRef<SVGSVGElement, ShareSolidIconProps>(
  function ShareSolidIcon(props: ShareSolidIconProps, ref) {
    return (
      <Icon
        data-testid="ShareSolidIcon"
        aria-label="share solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 2a2 2 0 0 1-3.508 1.313L3.957 5.581a1.992 1.992 0 0 1 0 .838l4.535 2.268a2 2 0 1 1-.448.894L3.509 7.313a2 2 0 1 1 0-2.626l4.535-2.268A2 2 0 1 1 12 2z" />
      </Icon>
    );
  }
);
