# @salt-ds/highcharts-theme

## 0.1.0

### Minor Changes

- df46ef9:

  ### Rationale

  A theme-only package for Highcharts offers a lightweight solution focused solely on styling, making it easier to maintain and update visual consistency across charts. Unlike a full React wrapper, it doesn't impose additional abstraction layers, allowing developers to leverage Highcharts' native capabilities directly. This approach minimizes overhead and complexity, providing flexibility to integrate with various frameworks or environments without being tied to a specific implementation.

  ### Supported charts

  This package provides styling for the following chart types:

  - Area
  - Bar
  - Box Plot
  - Bubble
  - Bullet
  - Candlestick
  - Column
  - Donut
  - Line
  - Pie
  - Scatter
  - Stacked Bar
  - Waterfall

  ### Usage

  Please see the package [README.md](https://github.com/jpmorganchase/salt-ds/blob/main/packages/highcharts-theme/README.md) for guidance on usage.

  ### License

  A license is required to use Highcharts.

  ### Migration

  The Salt Highcharts theme replaces previous approaches that bundled a chart wrapper with styling. Because this package contains **only** theme assets (CSS + Highcharts options), you can keep using any Highcharts integration you prefer and simply apply the theme.

  For detailed setup instructions, refer to the [Chart usage documentation](https://www.saltdesignsystem.com/salt/components/chart/usage).

- df46ef9: - `useChart` hook is density-aware. When Salt density changes, it triggers a `chart.redraw()` and returns a `legendIconSize` mapped to Salt size tokens, enabling responsive legend symbol sizing.

  - Salt theme defaults (styled mode): 20-color palette, vertical right-aligned legend with consistent spacing, larger title/axis-title margins, and line markers disabled by default.
  - Type compatibility: expose `HighchartsOptionsCompat` so newer fields (e.g. `plotOptions.pie.borderRadius`) type-check while staying assignable to upstream `Options` across Highcharts v10–v12.
  - CSS and usage guidance: import Salt base styles before the Highcharts theme, and wrap charts with `highcharts-theme-salt`; add `salt-fill-patterns` to opt into pattern fills.
    Example: `import "@salt-ds/theme/index.css"; import "@salt-ds/highcharts-theme/index.css";`

  Includes a Donut chart example using `useDensity` + `useChart` to demonstrate density reactivity and optional pattern fills.

- df46ef9: Added Area chart

  To see an example Options object required to configure a basic area chart, see the examples section.

- df46ef9: Added Bar Chart

  To see an example Options object required to configure a basic bar chart, see the examples section.

- df46ef9: Added Box plot chart

  To see an example Options object required to configure a basic box plot chart, see the examples section.

- df46ef9: Add Bubble Chart

  To see an example Options object required to configure a basic bubble chart, see the examples section.

- df46ef9: Added Bullet Chart

  To see an example Options object required to configure a basic bullet chart, see the examples section.

- df46ef9: Added Candlestick Chart

  To see an example Options object required to configure a basic candlestick chart, see the examples section.

- df46ef9: - Added PieChart
  - Since DonutChart is a variant of PieChart,the plotOptions.pie.innerSize setting is moved out of the global options; otherwise, a default PieChart would automatically become a DonutChart
  - Consumers are instructed to supply the innerSize setting themselves in documentation.
  - Documentation reordered to show PieChart first due to the above.

- df46ef9: Added Stacked bar chart

  To see an example Options object required to configure a basic stacked bar chart, see the examples section.

### Patch Changes

- Updated dependencies [ee94785]
- Updated dependencies [df46ef9]
- Updated dependencies [afe9104]
  - @salt-ds/core@1.54.2
  - @salt-ds/theme@1.38.0
