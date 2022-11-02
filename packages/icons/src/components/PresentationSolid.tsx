import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PresentationSolidIconProps = IconProps;

export const PresentationSolidIcon = forwardRef<
  SVGSVGElement,
  PresentationSolidIconProps
>(function PresentationSolidIcon(props: PresentationSolidIconProps, ref) {
  return (
    <Icon
      data-testid="PresentationSolidIcon"
      aria-label="presentation solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M0 4v6h4.493L3.25 11.243l.707.707 1.893-1.893 1.893 1.893.707-.707L7.207 10H12V4H0zm3 1h6v1H3V5zm0 2h6v1H3V7z" />
        <path d="M0 0v3h12V0H0z" />
      </>
    </Icon>
  );
});
