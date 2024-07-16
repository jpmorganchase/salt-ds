// WARNING: This file was generated by a script. Do not modify it manually

import { forwardRef } from "react";

import { Icon, type IconProps } from "../icon";

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
        <path
          fillRule="evenodd"
          d="M0 3h3V1h6v2h3v9H0V3Zm1 1v2h3V5h4v1h3V4H1Zm0 7V7h3v1h4V7h3v4H1Zm7-9H4v1h4V2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  },
);
