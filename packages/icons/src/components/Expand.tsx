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
        <>
          <path d="M0 0h4v1H1.707l2.889 2.889-.707.707L1 1.707V4H0V0z" />
          <path d="M12 12H8v-1h2.293L7.404 8.111l.707-.707L11 10.293V8h1v4z" />
          <path d="M12 0v4h-1V1.707L8.111 4.596l-.707-.707L10.293 1H8V0h4z" />
          <path d="M0 12V8h1v2.293l2.889-2.889.707.707L1.707 11H4v1H0z" />
        </>
      </Icon>
    );
  }
);
