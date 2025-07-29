import type HighchartsReact from "highcharts-react-official";
import { useEffect } from "react";

export const useChart = ({
  chartRef,
  somethingToTrigger,
}: {
  chartRef: React.RefObject<HighchartsReact.RefObject>;
  somethingToTrigger: unknown;
}) => {
  useEffect(() => {
    chartRef.current?.chart?.redraw();
  }, [somethingToTrigger]);
};
