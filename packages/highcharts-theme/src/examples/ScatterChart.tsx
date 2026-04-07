import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { scatterOptions } from "./dependencies";

export interface ScatterChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const ScatterChart: FC<ScatterChartProps> = ({
  fillPatterns = false,
  options = scatterOptions,
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

export default ScatterChart;
