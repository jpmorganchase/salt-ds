---
"@salt-ds/core": minor
"@salt-ds/countries": minor
"@salt-ds/date-components": minor
"@salt-ds/embla-carousel": minor
"@salt-ds/highcharts-theme": minor
"@salt-ds/icons": minor
"@salt-ds/lab": patch
"@salt-ds/styles": patch
"@salt-ds/window": patch
---

Added the `"use client"` directive to modules that use React, so Salt components can be imported directly from React Server Components, such as pages in the Next.js App Router. Modules that don't use React, such as utility functions, can still be used on the server.
