---
"@salt-ds/theme": minor
---

Added an experimental interim mobile density, available at `@salt-ds/theme/css/experimental/mobile-interim.css`.

It gives the mobile density more compact spacing, text and size values. For example, `--salt-spacing-100` is 12px instead of 16px, `--salt-text-fontSize` is 14px instead of 16px, and `--salt-size-base` is 40px instead of 44px.

To try it, import the stylesheet after your theme stylesheets so its values take precedence, and pass `density="mobile"` to `SaltProvider`.

```tsx
import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/experimental/mobile-interim.css";

<SaltProvider density="mobile">
  <App />
</SaltProvider>;
```

This density is experimental. Its tokens and values may change, or it may be removed, in any release without a major version bump. Its stylesheet will move out of the `experimental/` folder when it becomes stable. It isn't recommended for production use.
