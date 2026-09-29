---
"@salt-ds/theme": minor
---

Added an experimental Salt (Interim) theme, available at `@salt-ds/theme/css/salt-interim.css`.

To try it, import the stylesheets, load the fonts, and pass `theme="salt-interim"` to `SaltProvider`. The theme uses Roboto in weights 300, 400 and 600, each in normal and italic styles, and PT Mono for code.

```tsx
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/600.css";
import "@fontsource/roboto/600-italic.css";
import "@fontsource/pt-mono";
import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/salt-interim.css";

<SaltProvider theme="salt-interim">
  <App />
</SaltProvider>;
```

This theme is experimental. Its tokens and values may change, or it may be removed, in any release without a major version bump. It isn't recommended for production use.
