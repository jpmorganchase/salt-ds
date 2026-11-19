import Highcharts from "highcharts";
import { expect, it } from "vitest";
import { observeContainerSize } from "../../observe-container-size";

it("fits the chart to its host without a window resize", async () => {
  const host = document.body.appendChild(document.createElement("div"));
  host.style.width = "700px";
  const chart = Highcharts.chart(host, {});
  try {
    observeContainerSize(chart);
    expect(chart.chartWidth).toBe(700);
    host.style.width = "246px";
    await expect.poll(() => chart.chartWidth).toBe(246);
    host.style.width = "700px";
    await expect.poll(() => chart.chartWidth).toBe(700);
  } finally {
    chart.destroy();
    host.remove();
  }
});
