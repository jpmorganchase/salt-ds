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
      <path d="M9 5H3v1h6V5ZM3 7h6v1H3V7Z" />
      <path
        fillRule="evenodd"
        d="M0 0v10h4.493L3.25 11.243l.707.707 1.893-1.893 1.893 1.893.707-.707L7.207 10H12V0H0Zm11 1H1v2h10V1ZM1 9V4h10v5H1Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
