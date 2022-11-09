import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type InfoSecondaryIconProps = IconProps;

export const InfoSecondaryIcon = forwardRef<
  SVGSVGElement,
  InfoSecondaryIconProps
>(function InfoSecondaryIcon(props: InfoSecondaryIconProps, ref) {
  return (
    <Icon
      data-testid="InfoSecondaryIcon"
      aria-label="info secondary"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M5 2h2v2H5V2z" />
      <path d="M5 5h2v5H5V5z" />
      <path d="M0 12h12V0H0v12zM1 1h10v10H1V1z" />
    </Icon>
  );
});
