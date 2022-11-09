import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RemoveIconProps = IconProps;

export const RemoveIcon = forwardRef<SVGSVGElement, RemoveIconProps>(
  function RemoveIcon(props: RemoveIconProps, ref) {
    return (
      <Icon
        data-testid="RemoveIcon"
        aria-label="remove"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M12 5v2H0V5h12z" />
      </Icon>
    );
  }
);
