import type { Density } from "@salt-ds/core";
import { useDensity } from "@salt-ds/core";
import type HighchartsReact from "highcharts-react-official";
import { useEffect } from "react";

export const useChart = ({
  chartRef,
}: {
  chartRef: React.RefObject<HighchartsReact.RefObject>;
}): { legendIconSize: number } => {
  const density = useDensity();

  // biome-ignore lint/correctness/useExhaustiveDependencies: triggered by density change
  useEffect(() => {
    chartRef.current?.chart?.redraw();
  }, [chartRef, density]);

  // Map density to the value of the `--salt-size-icon` design token (in pixels)
  // as defined in packages/theme/css/foundations/size.css.
  const legendIconSizeMap: Record<Density, number> = {
    high: 10,
    medium: 12,
    low: 14,
    touch: 16,
  } as const;

  return {
    legendIconSize: legendIconSizeMap[density] ?? legendIconSizeMap.medium,
  };
};
