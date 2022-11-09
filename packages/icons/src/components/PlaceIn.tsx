import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PlaceInIconProps = IconProps;

export const PlaceInIcon = forwardRef<SVGSVGElement, PlaceInIconProps>(
  function PlaceInIcon(props: PlaceInIconProps, ref) {
    return (
      <Icon
        data-testid="PlaceInIcon"
        aria-label="place in"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 12h12V6h-1v5H1V1h5V0H0v12z" />
        <path d="M10.939 0 12 1.061 9.025 4.036 10.489 5.5h-4v-4l1.475 1.475L10.939 0z" />
      </Icon>
    );
  }
);
