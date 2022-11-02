import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type PresentationIconProps = IconProps;

export const PresentationIcon = forwardRef<
  SVGSVGElement,
  PresentationIconProps
>(function PresentationIcon(props: PresentationIconProps, ref) {
  return (
    <Icon
      data-testid="PresentationIcon"
      aria-label="presentation"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <>
        <path d="M9 5H3v1h6V5z" />
        <path d="M3 7h6v1H3V7z" />
        <path d="M0 0v10h4.493L3.25 11.243l.707.707 1.893-1.893 1.893 1.893.707-.707L7.207 10H12V0H0zm11 1v2H1V1h10zM1 9V4h10v5H1z" />
      </>
    </Icon>
  );
});
