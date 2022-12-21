import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ExpandIconProps = IconProps;

export const ExpandIcon = forwardRef<SVGSVGElement, ExpandIconProps>(
  function ExpandIcon(props: ExpandIconProps, ref) {
    return (
      <Icon
        data-testid="ExpandIcon"
        aria-label="expand"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 0h4v1H1.707l2.89 2.89-.708.706L1 1.707V4H0V0Zm12 12H8v-1h2.293l-2.89-2.89.708-.706L11 10.293V8h1v4Zm0-12v4h-1V1.707l-2.89 2.89-.706-.708L10.293 1H8V0h4ZM0 12V8h1v2.293l2.89-2.89.706.708L1.707 11H4v1H0Z" />
      </Icon>
    );
  }
);
