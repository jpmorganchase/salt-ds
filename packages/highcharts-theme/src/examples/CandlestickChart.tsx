import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import stock from "highcharts/modules/stock";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { candlestickOptions } from "./dependencies";

stock(Highcharts);

export interface CandlestickChartProps {
  patterns?: boolean;
  options: Options;
}

const CandlestickChart: FC<CandlestickChartProps> = ({
  patterns = false,
  options = candlestickOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default CandlestickChart;
