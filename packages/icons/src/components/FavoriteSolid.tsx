import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type FavoriteSolidIconProps = IconProps;

export const FavoriteSolidIcon = forwardRef<
  SVGSVGElement,
  FavoriteSolidIconProps
>(function FavoriteSolidIcon(props: FavoriteSolidIconProps, ref) {
  return (
    <Icon
      data-testid="FavoriteSolidIcon"
      aria-label="favorite solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M6 0 4.212 4.045 0 4.583l3.106 3.039L2.291 12l3.708-2.5L9.707 12l-.815-4.378 3.106-3.039-4.212-.538L5.998 0z" />
    </Icon>
  );
});
