import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RunReportIconProps = IconProps;

export const RunReportIcon = forwardRef<SVGSVGElement, RunReportIconProps>(
  function RunReportIcon(props: RunReportIconProps, ref) {
    return (
      <Icon
        data-testid="RunReportIcon"
        aria-label="run report"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="m4 5 4 2.5L4 10V5Z" />
        <path
          fillRule="evenodd"
          d="M1 0v12h10V2L9 0H1Zm6 4h3v7H2V1h5v3Zm3-1v-.586L8.586 1H8v2h2Z"
          clipRule="evenodd"
        />
      </Icon>
    );
  }
);
