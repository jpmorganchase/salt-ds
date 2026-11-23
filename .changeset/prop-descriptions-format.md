---
"@salt-ds/core": patch
"@salt-ds/date-components": patch
"@salt-ds/embla-carousel": patch
---

Tidied the formatting of prop descriptions: every description starts with a capital letter and ends with a period, uses American spelling and the multi-line `/** */` layout, and `@default` values are written as they are in code. Removed `@default false` and `@default undefined`, which describe how an unset prop already behaves.
