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

Many Highchart stylistic properties cannot be configured via CSS alone. To adhere to the Salt design system, import and set the [Highcharts global options](https://www.highcharts.com/docs/getting-started/how-to-set-options) at your entry point.

```js
import Highcharts from "highcharts";

Highcharts.setOptions(highchartsOptionsSalt);
```

### Compatibility with existing Highcharts options

If you already have a [Highcharts global options object](https://www.highcharts.com/docs/getting-started/how-to-set-options), you can call `Highcharts.setOptions` again with the `highchartsOptionsSalt` after your initial call. Any fields set by `highchartsOptionsSalt` will take precedence over any previously set fields.

For granular control, you can also use the `Highcharts.merge()` utility function to deep merge the `highchartsOptionsSalt` with your existing options object, including at the chart level.

To see which Options properties the Salt Highchart Theme package provides, see `src/highcharts-options-salt.ts`.

### Patterns and Fills

The Salt Highcharts theme also provides Salt patterns and fills that can be applied to create visible contrast between series. For example, the `salt-line-patterns` class applies
a line pattern to each series in a Line Chart.

Guidance on Fills TBA.
