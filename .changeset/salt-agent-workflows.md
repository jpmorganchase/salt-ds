---
"@salt-ds/cli": patch
"@salt-ds/core": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/react-resizable-panels-theme": patch
"@salt-ds/highcharts-theme": patch
"@salt-ds/ag-grid-theme": patch
---

Updated generated agent instructions to route component selection, composition changes and accessibility repairs to the relevant installed guidance, and to resolve documentation disagreements using evidence about the requested outcome and installed APIs. Added an accessibility-repair guide and preserved documented external-library requirements in generated component pages. Rerun `salt-ds init` after upgrading the CLI to refresh existing instructions.

Separated the task routes into labeled bullets with accessibility repair first. Added a tested dialog example that preserves the closing animation before removing its trigger and returning focus to a surviving record or empty-list action.
