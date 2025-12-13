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

Import Highcharts CSS **before** the Salt theme CSS (see Highcharts docs: [Style by CSS](https://www.highcharts.com/docs/chart-design-and-style/style-by-css)).

- Highcharts v10.2.0 CSS: `https://code.highcharts.com/10.2.0/css/highcharts.css`
- Highcharts v11+ CSS: `https://code.highcharts.com/your-version/css/highcharts.css`

```jsx
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import { useChart } from "@salt-ds/highcharts-theme";

import "@salt-ds/highcharts-theme/index.css";

export function MyChart({ chartOptions }) {
  const chartRef = useRef(null);
  const options = useChart(chartRef, chartOptions);

  return (
    <div className="highcharts-theme-salt">
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}
```

## Optional container classes

See [Chart usage](https://www.saltdesignsystem.com/salt/components/chart/usage) for details.

- `salt-line-patterns`
- `salt-fill-patterns`
- `axes-grid-lines`

## Accessibility

Enable the Highcharts accessibility module (v10 requires initialization; v11+ auto-initializes). See [Chart accessibility](https://www.saltdesignsystem.com/salt/components/chart/accessibility).
