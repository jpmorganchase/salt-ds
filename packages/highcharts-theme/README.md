# Salt Highcharts Theme

Salt Highcharts Theme is a package that adds Salt theme styles to Highcharts. The package contains a CSS file and a Highcharts global options object necessary for positional property application.

_Please note, this package is a WIP. Highcharts CSS files and Options object are not finalised._

## Supported Highchart versions

This package is compatible with version 10 to 12 of Highcharts.

Within the package CSS folder, the default theme is considered to be v10.

CSS changes from other major versions are isolated into their own file but feature in prior versions too.

### License

A license is required to use Highcharts.

## Installation

To install the Salt Highcharts theme package, ensure you have a supported version of Highcharts installed and add `@salt-ds/highcharts-theme` via your package manager

```bash
npm install @salt-ds/highcharts-theme
# or
yarn add @salt-ds/highcharts-theme
```

### Import Highcharts CSS

The Salt Highcharts theme overrides the default Highcharts CSS. To ensure the theme is applied correctly, import the Highcharts CSS before the Salt Highcharts theme CSS.

> You can download the [Highcharts CSS
> here](https://code.highcharts.com/10.2.0/css/highcharts.css), specifying the
> required version via the URL.
> For more information on loading Highcharts CSS, [visit the Highcharts docs](https://www.highcharts.com/docs/chart-design-and-style/style-by-css).

### Import Salt Highcharts theme

To import the Salt Highcharts theme, use:

```js
import "@salt-ds/highcharts-theme/index.css";
```

Then wrap your Highcharts with `highcharts-theme-salt` class name as shown below:

```jsx
<div className="highcharts-theme-salt">
  <HighchartsReact highcharts={Highcharts} options={yourChartSpecificOptions} />
</div>
```

### Set Highcharts Global options

Many Highchart stylistic properties can't be configured via CSS alone. To adhere to the Salt design system, import and set the [Highcharts global options](https://www.highcharts.com/docs/getting-started/how-to-set-options) at your entry point.

```js
import Highcharts from "highcharts";

Highcharts.setOptions(highchartsOptionsSalt);
```

### Compatibility with existing Highcharts options

If you already have a [Highcharts global options object](https://www.highcharts.com/docs/getting-started/how-to-set-options), you can call `Highcharts.setOptions` again with the `highchartsOptionsSalt` after your initial call. Any fields set by `highchartsOptionsSalt` will take precedence over any previously set fields.

For granular control, you can also use the `Highcharts.merge()` utility function to deep merge the `highchartsOptionsSalt` with your existing options object, including at the chart level.

To see which Options properties the Salt Highchart Theme package provides, see `src/highcharts-options-salt.ts`.

## Chart density

Highcharts doesn't automatically respond to changes in CSS custom properties after the initial render. Use the `useChart` hook to trigger redraws when density changes and to retrieve density‑aware values for your chart options.

The `useChart` hook takes a `chartRef` and reads the current Salt `density` internally.

```jsx
import { useRef, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useChart } from "@salt-ds/highcharts-theme";

export const DensityAwareChart = () => {
  const chartRef = useRef(null);

  // Force a redraw and grab density-aware values (density is read internally)
  const { legendIconSize } = useChart({ chartRef });

  const options = useMemo(
    () => ({
      chart: { type: "pie" },
      legend: {
        symbolHeight: legendIconSize,
        symbolWidth: legendIconSize,
      },
    }),
    [legendIconSize],
  );

  return (
    <div className="highcharts-theme-salt">
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
};
```

### Patterns and fills

The Salt Highcharts theme provides patterns and fills to create visible contrast between series. This improves accessibility and readability, especially for users who rely on non‑color cues.

#### Line patterns

Apply line patterns to line‑type charts by adding `salt-line-patterns` to the chart container (alongside `highcharts-theme-salt`).

```jsx
<div className="highcharts-theme-salt salt-line-patterns">
  <HighchartsReact highcharts={Highcharts} options={yourChartSpecificOptions} />
</div>
```

#### Fill patterns

Apply fill patterns (e.g., for donut/pie/bar) by adding `salt-fill-patterns` to the chart container.

```jsx
<div className="highcharts-theme-salt salt-fill-patterns">
  <HighchartsReact highcharts={Highcharts} options={yourChartSpecificOptions} />
</div>
```

Notes:

- Make sure the chart is wrapped with `highcharts-theme-salt` so the Salt theme styles apply.
- Patterns are purely CSS‑driven; Highcharts options don't need to be modified to enable them.
