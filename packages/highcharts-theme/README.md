# Salt Highcharts Theme

Salt Highcharts Theme is a package that adds Salt theme styles to Highcharts. The package contains a CSS file and a Highcharts global options object necessary for positional property application.

_Please note, this package is a WIP. Highcharts CSS files and Options object are not finalised._

## Supported Highchart versions

This package is compatible with version 10.2.0 specifically, or version 11+.

CSS changes from other major versions are isolated into their own file but feature in prior versions too.

### License

A license is required to use Highcharts.

## Installation

Install the following dependencies:

- `highcharts` - version 10.2.0 specifically, or version 11+
- `highcharts-react-official`
- `@salt-ds/highcharts-theme@0.0.0-snapshot-20250922124201`

```bash
npm install highcharts@10.2.0 highcharts-react-official @salt-ds/highcharts-theme@0.0.0-snapshot-20250922124201
# or
yarn add highcharts@10.2.0 highcharts-react-official @salt-ds/highcharts-theme@0.0.0-snapshot-20250922124201
```

### Import Highcharts CSS

The Salt Highcharts theme overrides the default Highcharts CSS. To ensure the theme is applied correctly, import the Highcharts CSS before the Salt Highcharts theme CSS.

You can download the Highcharts CSS from the official CDN:

- [For v10.2.0](https://code.highcharts.com/10.2.0/css/highcharts.css)
- For v11+: https://code.highcharts.com/your-version/css/highcharts.css

For more information on loading Highcharts CSS, [visit the Highcharts docs](https://www.highcharts.com/docs/chart-design-and-style/style-by-css).

### Import Salt Highcharts theme

To import the Salt Highcharts theme, use:

```js
import "@salt-ds/highcharts-theme/index.css";
```

Then wrap your Highcharts with `highcharts-theme-salt` class name as shown below:

```jsx
<div className="highcharts-theme-salt">
  <HighchartsReact highcharts={Highcharts} options={options} />
</div>
```

## useChart hook

Wrap your Highcharts options with the `useChart` hook to ensure the theme is applied correctly.

```jsx
import { useChart } from "@salt-ds/highcharts-theme";

const options = useChart(yourChartSpecificOptions);
```

See the [Highcharts options](https://www.highcharts.com/docs/getting-started/how-to-set-options) documentation for more information.

## Patterns and fills

The Salt Highcharts theme provides patterns and fills that can be applied to create visible contrast between series. This is particularly valuable for users with accessibility needs.

### Line patterns

To apply line patterns to charts such as LineChart, apply the `salt-line-patterns` class name to the chart container.

```jsx
<div className="highcharts-theme-salt salt-line-patterns">
  <HighchartsReact highcharts={Highcharts} options={options} />
</div>
```

### Fill patterns

To apply fill patterns to charts such as DonutChart, apply the `salt-fill-patterns` class name to the chart container.

```jsx
<div className="highcharts-theme-salt salt-fill-patterns">
  <HighchartsReact highcharts={Highcharts} options={options} />
</div>
```
