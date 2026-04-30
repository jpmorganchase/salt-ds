import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import patternFill from "highcharts/modules/pattern-fill";
import stock from "highcharts/modules/stock";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { candlestickOptions } from "./dependencies";

patternFill(Highcharts);
stock(Highcharts);

export interface CandlestickChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const CandlestickChart: FC<CandlestickChartProps> = ({
  fillPatterns = false,
  options = candlestickOptions,
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

export default CandlestickChart;
