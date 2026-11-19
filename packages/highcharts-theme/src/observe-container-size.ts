import Highcharts, { type Chart } from "highcharts";
import { isHighcharts10 } from "./highcharts-version";

const observedCharts = new WeakSet<Chart>();

// Highcharts 10 listens for window resize, which can fire before the chart's
// container has finished changing size. Observe the host for the final layout.
export function observeContainerSize(chart: Chart) {
  if (!isHighcharts10() || observedCharts.has(chart)) return;

  const host = chart.container.parentElement;
  const Observer = host?.ownerDocument.defaultView?.ResizeObserver;
  if (!host || !Observer) return;

  const observer = new Observer(() => {
    if (chart.options?.chart?.reflow !== false && chart.container) {
      chart.reflow();
    }
  });
  observer.observe(host);
  observedCharts.add(chart);
  Highcharts.addEvent(chart, "destroy", () => observer.disconnect());
}
