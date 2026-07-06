---
"@salt-ds/theme": minor
---

Added `@salt-ds/theme/css/baseline.css`, a new opt-in, minimal CSS reset for apps using Salt. Normalizes browser defaults on bare HTML tags (margin/padding, `box-sizing`, headings, media, form controls, `<button>`, `<a>`, `<table>`) that Salt itself does not style. Safe to use alongside Salt components—class-scoped Salt CSS wins by specificity.

Import once at the root of your app, after the theme CSS:

```ts
import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/theme-next.css";
import "@salt-ds/theme/css/baseline.css";
```

See the "Developing with Salt" getting-started guide for details.
