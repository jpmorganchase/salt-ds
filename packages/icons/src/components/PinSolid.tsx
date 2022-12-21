import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PinSolidIconProps = IconProps;

export const PinSolidIcon = forwardRef<SVGSVGElement, PinSolidIconProps>(
  function PinSolidIcon(props: PinSolidIconProps, ref) {
    return (
      <Icon
        data-testid="PinSolidIcon"
        aria-label="pin solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M2.714 4.286 2 5l1.984 1.984L.99 9.98 0 11.969l1.98-1 2.994-2.995L7 10l.714-.714a2.02 2.02 0 0 0 0-2.857L9.143 5l.714.714L12 3.571 8.429 0 6.286 2.143 7 2.857 5.571 4.286a2.02 2.02 0 0 0-2.857 0Z" />
      </Icon>
    );
  }
);
