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
        <>
          <path d="M8 7.5 4 5v5l4-2.5z" />
          <path d="M8.707 0 11 2.293V12H1V0h7.707zM1.5.5V0v.5zM2 1v10h8V4H7V1H2zm8 1.707L8.293 1H8v2h2v-.293z" />
        </>
      </Icon>
    );
  }
);
