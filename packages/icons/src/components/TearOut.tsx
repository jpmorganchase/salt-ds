import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type TearOutIconProps = IconProps;

export const TearOutIcon = forwardRef<SVGSVGElement, TearOutIconProps>(
  function TearOutIcon(props: TearOutIconProps, ref) {
    return (
      <Icon
        data-testid="TearOutIcon"
        aria-label="tear out"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <>
          <path d="M0 12h12V6h-1v5H1V1h5V0H0v12z" />
          <path d="M7.55 5.5 6.489 4.439l2.975-2.975L8 0h4v4l-1.475-1.475L7.55 5.5z" />
        </>
      </Icon>
    );
  }
);
