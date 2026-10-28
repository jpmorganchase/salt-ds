---
"@salt-ds/ag-grid-theme": minor
"@salt-ds/core": minor
"@salt-ds/countries": minor
"@salt-ds/date-components": minor
"@salt-ds/embla-carousel": minor
"@salt-ds/highcharts-theme": minor
"@salt-ds/icons": minor
"@salt-ds/lab": minor
"@salt-ds/react-resizable-panels-theme": minor
"@salt-ds/theme": minor
---

Added documentation for coding agents in each package's `docs` folder. It is generated from the Salt website for the published version, and covers component usage, props, examples and accessibility, plus patterns, design tokens, icons and country symbols. Each package also ships `docs/manifest.json`, which `salt-ds init` from `@salt-ds/cli` uses to add an index of the installed docs to your project's `AGENTS.md`, and `docs/salt-check.json`, which `salt-ds check` uses to check an application's Salt tokens, props and component parts against the installed docs.

Added application background setup guidance to the Core docs and clarified layering and mixed-mode guidance in the Theme docs.
