import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LineChartIconProps = IconProps;

export const LineChartIcon = forwardRef<SVGSVGElement, LineChartIconProps>(
  function LineChartIcon(props: LineChartIconProps, ref) {
    return (
      <Icon
        data-testid="LineChartIcon"
        aria-label="line chart"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M10.5 4a1.5 1.5 0 1 0-1.018-.399L7.599 8.003a1.486 1.486 0 0 0-.549.066L5.746 6.336a1.5 1.5 0 1 0-2.401.122L1.801 9.031l-.005-.001a1.5 1.5 0 1 0 .857.512l1.54-2.572a1.48 1.48 0 0 0 .75-.036l1.311 1.731a1.5 1.5 0 1 0 2.264-.267l1.883-4.401L10.5 4zM5.25 5.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm-3 5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm6-1a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-7a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z" />
      </Icon>
    );
  }
);
