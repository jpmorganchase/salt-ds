---
"@salt-ds/theme": minor
---

Added an experimental rem-based typography stylesheet, available at `@salt-ds/theme/css/experimental/rem-typography.css`.

It redefines the font size, line height and text min-height tokens for every density in the legacy, J.P. Morgan and J.P. Morgan (Interim) themes in rem instead of px. Text then scales with the user's browser font size setting as well as with page zoom. At the default browser font size of 16px, every value resolves to the same pixel size as before.

Import it after your theme stylesheets. If you also use `mobile-interim.css`, import it after this file so its mobile values take precedence.

```tsx
import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/experimental/rem-typography.css";
```

The stylesheet also sets the root element's font size to `100%` when `SaltProvider` applies its classes to `<html>`, so `1rem` resolves to the user's browser default font size rather than the density's body text size. Rem values in your own CSS will resolve against that size too.

Component heights and spacing are still defined in px, so at larger browser font sizes text may outgrow fixed-height components. Test your app with a larger browser font size before adopting it.

This stylesheet is experimental. Its tokens and values may change, or it may be removed, in any release without a major version bump. It isn't recommended for production use.
