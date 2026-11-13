import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useMemo, useRef } from "react";
import {
  conversionFunnelOptions,
  renderConversionFunnel,
} from "./dependencies/conversionFunnelOptions";

patternFill(Highcharts);
accessibility(Highcharts);

export interface ConversionFunnelChartProps {
  fillPatterns?: boolean;
  options?: Options;
  showConnectors?: boolean;
}

export default function ConversionFunnelChart({
  fillPatterns = false,
  options = conversionFunnelOptions,
  showConnectors = true,
}: ConversionFunnelChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const optionsWithDecorations = useMemo<Options>(
    () => ({
      ...options,
      chart: {
        ...options.chart,
        events: {
          ...options.chart?.events,
          render(event) {
            options.chart?.events?.render?.call(this, event);
            renderConversionFunnel(this, showConnectors);
          },
        },
      },
    }),
    [options, showConnectors],
  );
  const chartOptions = useChart(chartRef, optionsWithDecorations, {
    fillPatterns,
  });

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartRef}
    />
  );
}
