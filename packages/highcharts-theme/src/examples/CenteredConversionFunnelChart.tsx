import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { centeredConversionFunnelOptions } from "./dependencies/centeredConversionFunnelOptions";

highchartsMore(Highcharts);
patternFill(Highcharts);
accessibility(Highcharts);

export interface CenteredConversionFunnelChartProps {
  fillPatterns?: boolean;
  options?: Options;
}

const CenteredConversionFunnelChart: FC<CenteredConversionFunnelChartProps> = ({
  fillPatterns = false,
  options = centeredConversionFunnelOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartRef}
    />
  );
};

export default CenteredConversionFunnelChart;
