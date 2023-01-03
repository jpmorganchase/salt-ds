import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PlaySolidIconProps = IconProps;

export const PlaySolidIcon = forwardRef<SVGSVGElement, PlaySolidIconProps>(
  function PlaySolidIcon(props: PlaySolidIconProps, ref) {
    return (
      <Icon
        data-testid="PlaySolidIcon"
        aria-label="play solid"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path fillRule="evenodd" d="m1 0 11 6-11 6V0Z" clipRule="evenodd" />
      </Icon>
    );
  }
);
