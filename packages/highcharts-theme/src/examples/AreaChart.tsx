import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { areaOptions } from "./dependencies";

patternFill(Highcharts);

export interface AreaChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const AreaChart: FC<AreaChartProps> = ({
  fillPatterns = false,
  options = areaOptions,
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

export default AreaChart;
