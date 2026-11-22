---
"@salt-ds/core": minor
"@salt-ds/countries": minor
"@salt-ds/date-components": minor
"@salt-ds/embla-carousel": minor
"@salt-ds/highcharts-theme": patch
"@salt-ds/icons": minor
"@salt-ds/lab": patch
"@salt-ds/styles": patch
"@salt-ds/window": patch
---

Added the `"use client"` directive to modules that use React, so Salt components can be imported directly from React Server Components, such as pages in the Next.js App Router. Utilities in modules that don't use React, such as `makePrefixer`, can still be called on the server. Utilities and constants defined alongside components or hooks, such as `resolveResponsiveValue` and `DEFAULT_ICON_SIZE`, can only be used in Client Components.
