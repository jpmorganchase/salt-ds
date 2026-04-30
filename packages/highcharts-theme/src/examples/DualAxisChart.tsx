import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { dualAxisOptions } from "./dependencies";

patternFill(Highcharts);

export interface DualAxisChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const DualAxisChart: FC<DualAxisChartProps> = ({
  fillPatterns = false,
  options = dualAxisOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options, { fillPatterns });

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartRef}
    />
  );
};

export default DualAxisChart;
