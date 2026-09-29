---
"@salt-ds/theme": minor
---

Added an experimental Salt (Interim) theme, available at `@salt-ds/theme/css/salt-interim.css`.

To try it, import the stylesheets, load the Roboto font, and pass `theme="salt-interim"` to `SaltProvider`.

```tsx
import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/salt-interim.css";

<SaltProvider theme="salt-interim">
  <App />
</SaltProvider>;
```

This theme is experimental. Its tokens and values may change, or it may be removed, in any release without a major version bump. It isn't recommended for production use.
