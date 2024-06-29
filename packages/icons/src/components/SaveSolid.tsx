// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

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
        <path d="M9 7H3v2h6V7Z" />
        <path
          fillRule="evenodd"
          d="M3 0H0v12h12V3.293L8.707 0H8v4H3V0Zm7 6H2v4h8V6Z"
          clipRule="evenodd"
        />
        <path d="M4 0v3h3V0H4Z" />
      </Icon>
    );
  },
);
