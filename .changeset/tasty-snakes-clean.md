---
"@salt-ds/highcharts-theme": patch
---

- `useChart` hook is density-aware. When Salt density changes, it triggers a `chart.redraw()` and returns a `legendIconSize` mapped to Salt size tokens, enabling responsive legend symbol sizing.
- Salt theme defaults (styled mode): 20-color palette, vertical right-aligned legend with consistent spacing, larger title/axis-title margins, and line markers disabled by default.
- Type compatibility: expose `HighchartsOptionsCompat` so newer fields (e.g. `plotOptions.pie.borderRadius`) type-check while staying assignable to upstream `Options` across Highcharts v10–v12.
- CSS and usage guidance: import Salt base styles before the Highcharts theme, and wrap charts with `highcharts-theme-salt`; add `salt-fill-patterns` to opt into pattern fills.
  Example: `import "@salt-ds/theme/index.css"; import "@salt-ds/highcharts-theme/index.css";`

Includes a Donut chart example using `useDensity` + `useChart` to demonstrate density reactivity and optional pattern fills.
