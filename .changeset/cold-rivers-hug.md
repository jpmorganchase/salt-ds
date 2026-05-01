---
"@salt-ds/highcharts-theme": minor
---

Drive Salt Highcharts styling through chart options and `useChart` instead of package-level CSS imports.

The Highcharts theme now injects its required CSS and builds Salt defaults from tokens in the hook, so consumers no longer need to import `highcharts/css/highcharts.css`, `@salt-ds/highcharts-theme/index.css`, or wrap charts with the previous theme/pattern class names.

Accessibility patterns are now enabled with `useChart(chartRef, chartOptions, { fillPatterns: true })` after loading the Highcharts `pattern-fill` module. The hook also supports Salt color-axis configuration for token-aware continuous, threshold, and data-class color scales.
