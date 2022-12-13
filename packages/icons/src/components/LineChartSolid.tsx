import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type LineChartSolidIconProps = IconProps;

export const LineChartSolidIcon = forwardRef<
  SVGSVGElement,
  LineChartSolidIconProps
>(function LineChartSolidIcon(props: LineChartSolidIconProps, ref) {
  return (
    <Icon
      data-testid="LineChartSolidIcon"
      aria-label="line chart solid"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M10.5 4a1.5 1.5 0 1 0-1.017-.397l-1.886 4.4a1.516 1.516 0 0 0-.547.065L5.747 6.331a1.5 1.5 0 1 0-2.405.124L1.797 9.029a1.5 1.5 0 1 0 .857.515L4.199 6.97a1.48 1.48 0 0 0 .748-.038L6.25 8.669a1.5 1.5 0 1 0 2.266-.271l1.886-4.4c.032.002.065.003.098.003z" />
    </Icon>
  );
});
