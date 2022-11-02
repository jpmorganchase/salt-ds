import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type SaveSolidIconProps = IconProps;

export const SaveSolidIcon = forwardRef<SVGSVGElement, SaveSolidIconProps>(
  function SaveSolidIcon(props: SaveSolidIconProps, ref) {
    return (
      <Icon
        data-testid="SaveSolidIcon"
        aria-label="save solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M9 7H3v2h6V7z" />
          <path d="M3 0v4h5V0h.707L12 3.293V12H0V0h3zm7 6H2v4h8V6z" />
          <path d="M4 0v3h3V0H4z" />
        </>
      </Icon>
    );
  }
);
