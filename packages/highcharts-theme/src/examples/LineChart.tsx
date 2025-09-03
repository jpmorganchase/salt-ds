import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/lineOptions";

export interface LineChartProps {
  patterns?: boolean;
}

const LineChart: FC<LineChartProps> = ({ patterns = false }) => {
  const LineChartRef = useRef<HighchartsReact.RefObject>(null);

  const lineDataOptions = useChart(LineChartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-line-patterns": patterns,
      })}
    >
      <HighchartsReact
        ref={LineChartRef}
        highcharts={Highcharts}
        options={lineDataOptions}
      />
    </div>
  );
};

export default LineChart;
