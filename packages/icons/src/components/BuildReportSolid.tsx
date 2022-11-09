import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BuildReportSolidIconProps = IconProps;

export const BuildReportSolidIcon = forwardRef<
  SVGSVGElement,
  BuildReportSolidIconProps
>(function BuildReportSolidIcon(props: BuildReportSolidIconProps, ref) {
  return (
    <Icon
      data-testid="BuildReportSolidIcon"
      aria-label="build report solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M3 1h6v2h3v9H0V3h3V1Zm1 2h4V2H4v1Zm4 2H4v1H1v1h3v1h4V7h3V6H8V5Z"
        clipRule="evenodd"
      />
    </Icon>
  );
});
