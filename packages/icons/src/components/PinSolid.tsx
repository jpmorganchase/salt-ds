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
        <path d="M8.033.134v1.354L4.614 4.907H1.493l2.298 2.298-3.005 3.359-.707 1.414 1.414-.707 3.359-3.005 2.237 2.237V7.382L10.5 4h1.423L8.034.134z" />
      </Icon>
    );
  }
);
