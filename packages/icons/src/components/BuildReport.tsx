import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BuildReportIconProps = IconProps;

export const BuildReportIcon = forwardRef<SVGSVGElement, BuildReportIconProps>(
  function BuildReportIcon(props: BuildReportIconProps, ref) {
    return (
      <Icon
        data-testid="BuildReportIcon"
        aria-label="build report"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M0 3v9h12V3H9V1H3v2H0zm1 1h10v2H8V5H4v1H1V4zm0 7V7h3v1h4V7h3v4H1zm7-9v1H4V2h4z" />
      </Icon>
    );
  }
);
