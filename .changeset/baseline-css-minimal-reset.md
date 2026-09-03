---
"@salt-ds/theme": minor
---

Added `@salt-ds/theme/css/baseline.css`, a new opt-in CSS reset for apps using Salt. It removes browser-defined margins from the document body, headings and paragraphs so semantic elements can use Salt typography without also retaining browser spacing. Salt components remain self-contained and do not depend on the reset.

Import it once at the root of your app, before the theme CSS:

```ts
import "@salt-ds/theme/css/baseline.css";
import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/theme-next.css";
```

See the "Developing with Salt" getting-started guide for details.
