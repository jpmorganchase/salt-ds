import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { boxPlotOptions } from "./dependencies";

highchartsMore(Highcharts);

export interface BoxPlotChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const BoxPlotChart: FC<BoxPlotChartProps> = ({
  fillPatterns = false,
  options = boxPlotOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />;
};

export default BoxPlotChart;
