// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

export type FavoriteIconProps = IconProps;

export const FavoriteIcon = forwardRef<SVGSVGElement, FavoriteIconProps>(
  function FavoriteIcon(props: FavoriteIconProps, ref) {
    return (
      <Icon
        data-testid="FavoriteIcon"
        aria-label="favorite"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m6 0 1.788 4.045L12 4.584 8.894 7.622 9.708 12 6 9.5 2.292 12l.814-4.378L0 4.584l4.212-.539zm1.102 4.966L6 2.473 4.898 4.966l-2.722.347L4.187 7.28l-.476 2.556L6 8.294l2.288 1.542-.475-2.556 2.01-1.967z" />
      </Icon>
    );
  },
);
