# Salt Highcharts Theme

`@salt-ds/highcharts-theme` provides Salt styling and default configuration for [Highcharts](https://www.highcharts.com/).

See the Salt docs for usage, examples, and accessibility guidance: [Chart](https://www.saltdesignsystem.com/salt/components/chart).

## Highcharts support

Compatible with **Highcharts 10.2.0** (specifically) and **Highcharts 11+**.

## License

A Highcharts license is required.

## Installation

```bash
npm install highcharts@10.2.0 highcharts-react-official @salt-ds/highcharts-theme
# or
yarn add highcharts@10.2.0 highcharts-react-official @salt-ds/highcharts-theme
```

## Quick start

```jsx
import Highcharts from "highcharts";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import { useChart } from "@salt-ds/highcharts-theme";

patternFill(Highcharts);

export function MyChart({ chartOptions }) {
  const chartRef = useRef(null);
  const options = useChart(chartRef, chartOptions, { fillPatterns: true });

  return (
    <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} />
  );
}
```

If you are using Highcharts v12+, import `highcharts/modules/pattern-fill` for its side effect instead of calling it with the `Highcharts` instance.

## Fill patterns

See [Chart usage](https://www.saltdesignsystem.com/salt/components/chart/usage) for details.

After enabling the Highcharts `pattern-fill` module, turn on accessibility patterns through the hook options when you need a non-color cue in classic mode. Filled series receive pattern fills, while line charts stay on the standard Salt data-viz colours and use the predefined Salt dash-pattern sequence:

```jsx
const options = useChart(chartRef, chartOptions, { fillPatterns: true });
```

## Accessibility

Enable the Highcharts accessibility module. For consistent behavior in Highcharts v10 and v11, initialize it with your `Highcharts` instance; in Highcharts v12+ it auto-initializes on import. See [Chart accessibility](https://www.saltdesignsystem.com/salt/components/chart/accessibility).
