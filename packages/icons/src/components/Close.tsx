import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CloseIconProps = IconProps;

export const CloseIcon = forwardRef<SVGSVGElement, CloseIconProps>(
  function CloseIcon(props: CloseIconProps, ref) {
    return (
      <Icon
        data-testid="CloseIcon"
        aria-label="close"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M1.407.343.346 1.404 4.942 6 .346 10.596l1.061 1.061 4.596-4.596 4.596 4.596 1.061-1.061L7.064 6l4.596-4.596L10.599.343 6.003 4.939 1.407.343z" />
      </Icon>
    );
  }
);
