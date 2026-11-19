import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import heatmap from "highcharts/modules/heatmap";
import { expect, it } from "vitest";
import { getDefaultOptions } from "../../default-options";
import { getDensityTokenMap } from "../../density-token-map";
import { mergeChartOptions } from "../../merge-chart-options";

heatmap(Highcharts);
accessibility(Highcharts);

it("renders a continuous heatmap after applying the forced-colors theme", () => {
  const options: Options = {
    colorAxis: { min: 0, max: 1 },
    series: [
      {
        type: "heatmap",
        data: [
          [0, 0, 0],
          [1, 0, 1],
        ],
      },
    ],
  };
  const container = document.body.appendChild(document.createElement("div"));
  const defaults = getDefaultOptions(
    options,
    getDensityTokenMap("medium", container),
  );
  const chart = Highcharts.chart(
    container,
    mergeChartOptions(defaults, options),
  );
  try {
    chart.update(chart.options.accessibility?.highContrastTheme);
    expect(chart.series[0].points).toHaveLength(2);
    for (const point of chart.series[0].points) {
      expect(point.graphic?.element.isConnected).toBe(true);
    }
  } finally {
    chart.destroy();
    container.remove();
  }
});
