// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type KeySolidIconProps = IconProps;

export const KeySolidIcon = forwardRef<SVGSVGElement, KeySolidIconProps>(
  function KeySolidIcon(props: KeySolidIconProps, ref) {
    return (
      <Icon
        data-testid="KeySolidIcon"
        aria-label="key solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path
          fillRule="evenodd"
          d="M10 6H7.5l-.735.735a3.5 3.5 0 1 1-2.378-2.122L9 0h3v4h-2zM3.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
