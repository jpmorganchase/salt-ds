import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type BarChartIconProps = IconProps;

export const BarChartIcon = forwardRef<SVGSVGElement, BarChartIconProps>(
  function BarChartIcon(props: BarChartIconProps, ref) {
    return (
      <Icon
        data-testid="BarChartIcon"
        aria-label="bar chart"
        viewBox="0 0 12 12"
        ref={ref}
        {...props}
      >
        <path d="M6 1h1v9h1V7h1v3h1V4h1v7H0V6h1v4h1V8h1v2h1V5h1v5h1V1z" />
      </Icon>
    );
  }
);
