import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SaveIconProps = IconProps;

export const SaveIcon = forwardRef<SVGSVGElement, SaveIconProps>(
  function SaveIcon(props: SaveIconProps, ref) {
    return (
      <Icon
        data-testid="SaveIcon"
        aria-label="save"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M10 6v4H2V6h8zM9 7H3v2h6V7z" />
        <path d="M0 0h8.707L12 3.293V12H0V0zm3 1H1v10h10V3.707L8.293 1H8v3H3V1zm4 0H4v2h3V1z" />
      </Icon>
    );
  }
);
