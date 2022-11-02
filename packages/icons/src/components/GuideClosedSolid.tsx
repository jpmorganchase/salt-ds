import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type GuideClosedSolidIconProps = IconProps;

export const GuideClosedSolidIcon = forwardRef<
  SVGSVGElement,
  GuideClosedSolidIconProps
>(function GuideClosedSolidIcon(props: GuideClosedSolidIconProps, ref) {
  return (
    <Icon
      data-testid="GuideClosedSolidIcon"
      aria-label="guide closed solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 1v11H1.875v-2H1V9h.875V8H1V7h.875V6H1V5h.875V4H1V3h.875V1H11ZM5 2H4v9h1V2Zm1 3V4h3v1H6Zm0 1v1h3V6H6Z"
      />
    </Icon>
  );
});
