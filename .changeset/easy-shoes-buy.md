---
"@salt-ds/highcharts-theme": major
---

Marked `@salt-ds/highcharts-theme` as stable.

The package provides Salt styling and default chart options for Highcharts through the `useChart` hook. `useChart` reads Salt theme and density values, builds the Salt defaults for the chart, and injects the required Highcharts theme CSS so consumers no longer need to manage those styles manually.

Consumer chart options are still supplied as regular Highcharts options. Salt defaults are applied first, then the user-supplied options are merged on top, so product-specific chart configuration takes priority while keeping the Salt baseline styling, accessibility patterns, and optional Salt color-axis support available through the hook.

This stable release supports Highcharts v10, v11, and v12.

See the Chart usage docs for further setup details, module-loading guidance, and examples of supported chart types.

```tsx
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import { useChart } from "@salt-ds/highcharts-theme";

export function MyChart({ chartOptions }) {
  const chartRef = useRef(null);
  const options = useChart(chartRef, chartOptions);

  return (
    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
  );
}
```
