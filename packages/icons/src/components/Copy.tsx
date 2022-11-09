import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type CopyIconProps = IconProps;

export const CopyIcon = forwardRef<SVGSVGElement, CopyIconProps>(
  function CopyIcon(props: CopyIconProps, ref) {
    return (
      <Icon
        data-testid="CopyIcon"
        aria-label="copy"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M4 0h4.707L11 2.293V9H8v3H1V3h3V0zm1 1v7h5V4H7V1H5zm3 0v2h2v-.293L8.293 1H8zM2 4v7h5V9H4V4H2z" />
      </Icon>
    );
  }
);
