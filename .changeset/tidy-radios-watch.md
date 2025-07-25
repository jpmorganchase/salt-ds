---
"@salt-ds/highcharts-theme": minor
---

### Summary

Salt Highcharts theme is a package that supplies the Salt theme for Highcharts. It includes a CSS file for all CSS-based styles, and an options object for styles that are not CSS configurable. Together, they provide a complete theming solution for Highcharts version 10 to version 12.

_Please note, this package is a WIP. Highcharts CSS files and Options object are not finalised._

### Rationale

A theme-only package for Highcharts offers a lightweight solution focused solely on styling, making it easier to maintain and update visual consistency across charts. Unlike a full React wrapper, it doesn't impose additional abstraction layers, allowing developers to leverage Highcharts' native capabilities directly. This approach minimizes overhead and complexity, providing flexibility to integrate with various frameworks or environments without being tied to a specific implementation.

### Supported charts

This package is a work in progress and represents a snapshot release focusing specifically on the LineChart.

Our intent is to gather feedback on the provided solution, allowing us to refine and expand the theme to support additional chart types in future, incremental releases.

### Usage

Please see the package [README.md](https://github.com/jpmorganchase/salt-ds/blob/main/packages/highcharts-theme/README.md) for guidance on usage.

### License

A license is required to use Highcharts.

### Migration

The Salt Highcharts theme replaces previous approaches that bundled a chart wrapper with styling. Because this package contains **only** theme assets (CSS + Highcharts options), you can keep using any Highcharts integration you prefer and simply apply the theme.

**Steps to migrate**

1. **Install the package** (snapshot build, requires Highcharts 10 – 12):

   ```bash
   # npm
   npm install @salt-ds/highcharts-theme

   # yarn
   yarn add @salt-ds/highcharts-theme
   ```

2. **Import the theme resources** at your application entry point:

   ```ts
   import "@salt-ds/highcharts-theme/index.css";

   // Salt CSS overrides
   import Highcharts from "highcharts";
   import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";

   // apply global theme options
   Highcharts.setOptions(highchartsOptionsSalt);
   ```

3. **Continue using your existing chart code.** For React you might use `highcharts-react-official` (or any other wrapper):

   ```jsx
   <div className="highcharts-theme-salt">
     <HighchartsReact highcharts={Highcharts} options={chartOptions} />
   </div>
   ```

4. **Merge additional options as required.** Highcharts deep-merges subsequent calls to `Highcharts.setOptions`; you can also combine objects per-chart with `Highcharts.merge()`.

**Things to watch for:**

- This snapshot styles **LineChart** only; other chart types will fall back to default Highcharts styles until future releases.
- Ensure the Salt CSS is loaded **after** the default Highcharts CSS to guarantee correct specificity.
- If a previous wrapper injected theme styles automatically, you must now call `Highcharts.setOptions` yourself and add the `highcharts-theme-salt` class to chart containers.
