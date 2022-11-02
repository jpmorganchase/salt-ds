import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type RunReportSolidIconProps = IconProps;

export const RunReportSolidIcon = forwardRef<
  SVGSVGElement,
  RunReportSolidIconProps
>(function RunReportSolidIcon(props: RunReportSolidIconProps, ref) {
  return (
    <Icon
      data-testid="RunReportSolidIcon"
      aria-label="run report solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 0v12h10V2.293L8.707 0H1Zm6 1h1v2h2v1H7V1ZM4 5l4 2.5L4 10V5Z"
      />
    </Icon>
  );
});
