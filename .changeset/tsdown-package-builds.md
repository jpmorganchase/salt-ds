---
"@salt-ds/core": patch
"@salt-ds/countries": patch
"@salt-ds/date-adapters": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
"@salt-ds/highcharts-theme": patch
"@salt-ds/icons": patch
"@salt-ds/lab": patch
"@salt-ds/styles": patch
"@salt-ds/window": patch
---

Packages are now built with tsdown and their type declarations are generated with TypeScript 7. Entry points, export maps and existing deep import paths are unchanged. The compiled output now includes shared compiler helper modules under `_virtual/`.
